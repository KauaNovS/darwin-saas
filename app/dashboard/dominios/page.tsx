import { createClient } from "@/lib/supabase/server";
import CatalogoDominiosClient from "./CatalogoDominiosClient";
export default async function CatalogoDominiosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tipos } = await supabase.from("dominio_tipos").select("*").eq("user_id", user!.id).order("dominio");
  return <CatalogoDominiosClient tipos={tipos ?? []} />;
}