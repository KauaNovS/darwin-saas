import { createClient } from "@/lib/supabase/server";
import CatalogoEmocoesClient from "./CatalogoEmocoesClient";
export default async function CatalogoEmocoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: emocoes } = await supabase.from("emocoes_catalogo").select("*").eq("user_id", user!.id).order("nome");
  return <CatalogoEmocoesClient emocoes={emocoes ?? []} />;
}