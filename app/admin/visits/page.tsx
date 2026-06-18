import { isAuthed } from "@/lib/auth";
import AdminLogin from "../AdminLogin";
import AdminVisits from "../AdminVisits";

export const dynamic = "force-dynamic";

export default async function AdminVisitsPage() {
  if (!(await isAuthed())) {
    return <AdminLogin />;
  }
  return <AdminVisits />;
}
