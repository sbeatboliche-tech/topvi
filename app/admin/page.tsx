import { isAuthed } from "@/lib/auth";
import { listOrders } from "@/lib/db";
import AdminLogin from "./AdminLogin";
import AdminTable from "./AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) {
    return <AdminLogin />;
  }
  const orders = await listOrders();
  return <AdminTable initialOrders={orders} />;
}
