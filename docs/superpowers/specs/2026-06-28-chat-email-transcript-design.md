# Chat Email Transcript — Design

## Contexto
El admin puede responder manualmente a tickets de soporte en `/admin/chats`. El cliente no recibe ninguna notificación por email cuando el admin le responde. Se agrega un botón manual para enviarle la transcripción completa de la conversación.

## Comportamiento

- En el panel de conversación activa, si el ticket tiene un email detectado (`conv.email !== null`), aparece el botón **"✉️ Enviar por email"** en el header.
- Al hacer clic, se envía la transcripción completa al email del cliente.
- El botón muestra estado de carga y luego "✓ Enviado" por unos segundos.
- Si no hay email en la conversación, el botón no aparece.

## Implementación

### 1. `lib/email.ts` — nueva función `sendChatTranscript`
- Recibe `(email: string, messages: ChatMsg[])`.
- Formatea cada mensaje con su rol (Cliente / Valentina / Atención) y timestamp.
- Diseño visual consistente con el resto de emails del proyecto (fondo oscuro, `#141417`).
- Subject: `"Tu consulta en TopViralMarketing"`.

### 2. `app/api/admin/chats/email/route.ts` — nuevo endpoint
- `POST { cid }` — requiere auth (`isAuthed()`).
- Llama `conversationMessages(cid)` para obtener los mensajes.
- Extrae el email buscando el regex en mensajes de rol `"user"` (misma lógica que `listConversations`).
- Si no encuentra email → `{ error: "Sin email" }` 400.
- Llama `sendChatTranscript` y devuelve `{ ok: true }`.

### 3. `app/admin/AdminChats.tsx` — UI
- En el header de la conversación activa, si `convs.find(c => c.conversationId === active)?.email` existe, mostrar el botón.
- Estado local `emailSent: boolean` para mostrar "✓ Enviado" tras el envío.

## Verificación
Abrir un ticket de prueba con email en el mensaje, verificar que el botón aparece, hacer clic y confirmar que llega el email con la transcripción correcta.
