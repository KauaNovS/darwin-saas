import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect("/auth"); }
  return (<div className="min-h-screen bg-[#0e0f1a] flex"><Sidebar userEmail={user.email??""}/><main className="flex-1 md:ml-60 min-h-screen">{children}</main></div>);
}