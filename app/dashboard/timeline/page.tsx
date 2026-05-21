import { createClient } from "@/lib/supabase/server";
import { Clock } from "lucide-react";
import { TIPO_EVENTO_LABELS, TIPO_EVENTO_CORES, cn } from "@/lib/utils";
import { Evento, Projeto } from "@/types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
function groupByDay(eventos: Evento[]) { const groups: Record<string,Evento[]>={}; for (const ev of eventos){const date=ev.created_at.split("T")[0]; if(!groups[date])groups[date]=[]; groups[date].push(ev);} return Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])); }
function dayLabel(dateStr: string) { const date=new Date(dateStr+"T12:00:00"); if(isToday(date))return "Hoje"; if(isYesterday(date))return "Ontem"; if(isThisWeek(date))return format(date,"EEEE",{locale:ptBR}); return format(date,"d 'de' MMMM, yyyy",{locale:ptBR}); }
export default async function TimelinePage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const [{data:eventos},{data:projetos}]=await Promise.all([supabase.from("eventos").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}),supabase.from("projetos").select("id,nome,cor").eq("user_id",user!.id)]);
  const eventosList=(eventos??[]) as Evento[];
  const projetoMap=Object.fromEntries(((projetos??[]) as Pick<Projeto,"id"|"nome"|"cor">[]).map(p=>[p.id,p]));
  const groups=groupByDay(eventosList);
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto page-enter">
      <div className="mb-8"><h1 className="text-xl font-bold text-white flex items-center gap-2"><Clock size={18} className="text-amber-400"/>Timeline</h1><p className="text-zinc-500 text-sm mt-0.5">Seu histórico contextual</p></div>
      {groups.length===0&&<div className="card p-10 text-center"><Clock size={32} className="text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500">Nenhum evento registrado ainda.</p></div>}
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-darwin-500/40 via-darwin-500/10 to-transparent"/>
        <div className="space-y-8 pl-6">
          {groups.map(([date,evs])=>(
            <div key={date}>
              <div className="flex items-center gap-3 mb-3 -ml-6"><div className="w-3.5 h-3.5 rounded-full bg-darwin-600/30 border border-darwin-500/50 flex-shrink-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-darwin-400"/></div><p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{dayLabel(date)}</p><span className="text-xs text-zinc-700">{evs.length} eventos</span></div>
              <div className="space-y-2">{evs.map(ev=>{const projeto=ev.projeto_id?projetoMap[ev.projeto_id]:null; return(<div key={ev.id} className="card p-3.5"><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><p className="text-sm font-medium text-zinc-200">{ev.titulo}</p>{ev.descricao&&<p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">{ev.descricao}</p>}<div className="flex items-center gap-2 flex-wrap mt-2"><span className={cn("badge text-xs",TIPO_EVENTO_CORES[ev.tipo])}>{TIPO_EVENTO_LABELS[ev.tipo]}</span>{ev.emocao&&<span className="text-xs text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-full">{ev.emocao}</span>}{ev.energia!==undefined&&<span className="text-xs text-zinc-600">⚡ {ev.energia}/10</span>}{projeto&&<span className="flex items-center gap-1 text-xs text-zinc-600"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:projeto.cor??"#6371f2"}}/>{projeto.nome}</span>}</div></div><span className="text-xs text-zinc-700 flex-shrink-0">{format(new Date(ev.created_at),"HH:mm")}</span></div></div>);})}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}