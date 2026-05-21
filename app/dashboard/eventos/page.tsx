import { createClient } from "@/lib/supabase/server";
import EventosClient from "./EventosClient";
export default async function EventosPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const [{data:eventos},{data:projetos}]=await Promise.all([supabase.from("eventos").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}),supabase.from("projetos").select("id,nome,cor").eq("user_id",user!.id).neq("status","arquivado")]);
  return <EventosClient eventos={eventos??[]} projetos={projetos??[]}/>;
}