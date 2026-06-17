import { isAuthed } from "@/lib/auth";
import { listLeads } from "@/lib/leads";
import AdminLogin from "../AdminLogin";
import AdminLeads from "../AdminLeads";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  if (!(await isAuthed())) {
    return <AdminLogin />;
  }
  const leads = await listLeads();
  return <AdminLeads initialLeads={leads} />;
}
