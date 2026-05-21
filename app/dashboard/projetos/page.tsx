import { createClient } from "@/lib/supabase/server";
import ProjetosClient from "./ProjetosClient";
export default async function ProjetosPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const [{data:projetos},{data:eventosCount}]=await Promise.all([supabase.from("projetos").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}),supabase.from("eventos").select("projeto_id").eq("user_id",user!.id).not("projeto_id","is",null)]);
  const countMap: Record<string,number>={};
  for (const ev of (eventosCount??[])) { if(ev.projeto_id){countMap[ev.projeto_id]=(countMap[ev.projeto_id]??0)+1;} }
  return <ProjetosClient projetos={projetos??[]} eventosCount={countMap}/>;
}