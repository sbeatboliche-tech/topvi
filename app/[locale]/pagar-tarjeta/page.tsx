"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

// Pago con tarjeta de crédito vía MercadoPago Checkout Transparente (Bricks).
// El cliente carga la tarjeta acá mismo; mostramos hasta 3 cuotas sin interés.
// Requiere NEXT_PUBLIC_MP_PUBLIC_KEY en las variables de entorno.

declare global {
  interface Window {
    MercadoPago?: new (key: string, opts?: { locale?: string }) => {
      bricks: () => {
        create: (
          type: string,
          containerId: string,
          settings: unknown
        ) => Promise<unknown>;
      };
    };
  }
}

interface OrderInfo {
  id: string;
  amount: number;
  currency: string;
  payerEmail: string;
  title: string;
}

export default function PagarTarjeta() {
  return (
    <Suspense fallback={<div className="px-4 py-12 text-muted">Cargando…</div>}>
      <PagarTarjetaInner />
    </Suspense>
  );
}

function PagarTarjetaInner() {
  const router = useRouter();
  const params = useParams();
  const locale = String(params.locale ?? "ar");
  const search = useSearchParams();
  const orderId = search.get("order");

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const mounted = useRef(false);

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  // 1) Traer datos de la orden
  useEffect(() => {
    if (!orderId) {
      setError("Falta el número de orden.");
      return;
    }
    fetch(`/api/orders/get?id=${orderId}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setOrder(d)))
      .catch(() => setError("No se pudo cargar la orden."));
  }, [orderId]);

  // 2) Cargar SDK de MercadoPago y montar el Brick de tarjeta
  useEffect(() => {
    if (!order || mounted.current) return;
    if (!publicKey) {
      setError("Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY.");
      return;
    }
    mounted.current = true;

    const init = () => {
      if (!window.MercadoPago) return;
      const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
      mp.bricks().create("cardPayment", "cardPaymentBrick", {
        initialization: {
          amount: order.amount,
          payer: { email: order.payerEmail || undefined },
        },
        customization: {
          paymentMethods: { maxInstallments: 3, minInstallments: 1 },
          visual: { style: { theme: "dark" } },
        },
        callbacks: {
          onReady: () => {},
          onError: (e: unknown) => {
            console.error(e);
            setError("Error al cargar el formulario de tarjeta.");
          },
          onSubmit: async (formData: {
            token: string;
            installments: number;
            payment_method_id: string;
            issuer_id?: string;
            payer?: { email?: string };
          }) => {
            setStatus("procesando");
            const res = await fetch("/api/mercadopago/process-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                token: formData.token,
                installments: formData.installments,
                payment_method_id: formData.payment_method_id,
                issuer_id: formData.issuer_id,
                payerEmail: formData.payer?.email || order.payerEmail,
              }),
            });
            const data = await res.json();
            if (data.status === "approved") {
              router.push(`/${locale}/gracias?order=${order.id}&method=tarjeta`);
            } else {
              setStatus("");
              setError(
                data.error ||
                  `El pago no se aprobó (${data.detail || data.status || "rechazado"}). Probá otra tarjeta.`
              );
            }
          },
        },
      });
    };

    const existing = document.getElementById("mp-sdk");
    if (existing) {
      init();
    } else {
      const s = document.createElement("script");
      s.id = "mp-sdk";
      s.src = "https://sdk.mercadopago.com/js/v2";
      s.onload = init;
      document.body.appendChild(s);
    }
  }, [order, publicKey, locale, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">Pagar con tarjeta de crédito</h1>
      <p className="mt-1 text-sm text-muted">
        💳 Hasta <b>3 cuotas sin interés</b> · pago seguro con MercadoPago
      </p>

      {order && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{order.title || "Tu pedido"}</span>
            <span className="font-semibold">
              {new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: order.currency,
                maximumFractionDigits: 0,
              }).format(order.amount)}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          {error}
        </p>
      )}

      {status === "procesando" && (
        <p className="mt-4 text-sm text-accent">Procesando el pago…</p>
      )}

      {/* Acá MercadoPago monta el formulario de tarjeta */}
      <div id="cardPaymentBrick" className="mt-6" />

      {!order && !error && (
        <p className="mt-6 text-sm text-muted">Cargando…</p>
      )}
    </div>
  );
}
