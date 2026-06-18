import { isAuthed } from "@/lib/auth";
import AdminLogin from "../AdminLogin";
import AdminChats from "../AdminChats";

export const dynamic = "force-dynamic";

export default async function AdminChatsPage() {
  if (!(await isAuthed())) {
    return <AdminLogin />;
  }
  return <AdminChats />;
}
