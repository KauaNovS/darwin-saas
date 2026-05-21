import { createClient } from "@/lib/supabase/server";
import { TrendingUp, HelpCircle, Repeat2, ArrowUpRight } from "lucide-react";
import { detectarPadroes, gerarQuestionamentos } from "@/lib/padroes";
import { TIPO_EVENTO_LABELS, cn } from "@/lib/utils";
import { Evento } from "@/types";
export default async function PadroesPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const {data:eventos}=await supabase.from("eventos").select("*").eq("user_id",user!.id).order("created_at",{ascending:false});
  const eventosList=(eventos??[]) as Evento[];
  const padroes=detectarPadroes(eventosList); const questionamentos=gerarQuestionamentos(eventosList);
  const porTipo: Record<string,number>={}; const porDominio: Record<string,number>={};
  for (const ev of eventosList){porTipo[ev.tipo]=(porTipo[ev.tipo]??0)+1; if(ev.dominio)porDominio[ev.dominio]=(porDominio[ev.dominio]??0)+1;}
  const energias=eventosList.filter(e=>e.energia!==undefined).map(e=>e.energia!);
  const mediaEnergia=energias.length>0?(energias.reduce((a,b)=>a+b,0)/energias.length).toFixed(1):null;
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto page-enter">
      <div className="mb-8"><h1 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp size={18} className="text-violet-400"/>Padrões</h1><p className="text-zinc-500 text-sm mt-0.5">Análise contextual dos seus registros</p></div>
      {eventosList.length<3?(<div className="card p-10 text-center"><TrendingUp size={32} className="text-zinc-700 mx-auto mb-3"/><p className="text-zinc-400 font-medium">Dados insuficientes</p><p className="text-zinc-600 text-sm mt-1">Registre pelo menos 3 eventos para detectar padrões.</p></div>):(
        <div className="space-y-6">
          {mediaEnergia&&<div className="grid grid-cols-3 gap-3"><div className="card p-4 text-center"><p className="text-2xl font-bold text-white">{mediaEnergia}</p><p className="text-xs text-zinc-500 mt-1">Energia média</p></div><div className="card p-4 text-center"><p className="text-2xl font-bold text-white">{eventosList.length}</p><p className="text-xs text-zinc-500 mt-1">Total de eventos</p></div><div className="card p-4 text-center"><p className="text-2xl font-bold text-white">{padroes.length}</p><p className="text-xs text-zinc-500 mt-1">Padrões detectados</p></div></div>}
          {padroes.length>0&&<div className="card p-5"><h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Repeat2 size={15} className="text-violet-400"/>Padrões detectados</h2><div className="space-y-3">{padroes.map((p,i)=>(<div key={i} className="p-4 rounded-lg bg-[#0e0f1a] border border-[rgba(99,113,242,0.08)]"><p className="text-sm text-zinc-300">{p.descricao}</p><p className="text-xs text-zinc-700 mt-1">Baseado em {p.eventos_ids.length} eventos</p></div>))}</div></div>}
          {questionamentos.length>0&&<div className="card p-5"><h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><HelpCircle size={15} className="text-darwin-400"/>Questionamentos reflexivos</h2><div className="space-y-3">{questionamentos.map((q,i)=>(<div key={i} className="flex gap-3 p-4 rounded-lg bg-darwin-600/5 border border-darwin-500/10"><span className="text-darwin-500 text-xs font-mono mt-0.5">0{i+1}</span><p className="text-sm text-zinc-400 leading-relaxed">{q}</p></div>))}</div></div>}
          {Object.keys(porTipo).length>0&&<div className="card p-5"><h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><ArrowUpRight size={15} className="text-emerald-400"/>Distribuição por tipo</h2><div className="space-y-2">{Object.entries(porTipo).sort((a,b)=>b[1]-a[1]).map(([tipo,count])=>(<div key={tipo} className="flex items-center gap-3"><span className="text-xs text-zinc-400 w-24 flex-shrink-0">{TIPO_EVENTO_LABELS[tipo as keyof typeof TIPO_EVENTO_LABELS]??tipo}</span><div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-darwin-600/60 rounded-full" style={{width:`${(count/eventosList.length)*100}%`}}/></div><span className="text-xs text-zinc-600 w-6 text-right">{count}</span></div>))}</div></div>}
        </div>
      )}
    </div>
  );
}