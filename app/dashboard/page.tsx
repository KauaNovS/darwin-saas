import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, FolderKanban, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { TIPO_EVENTO_LABELS, DOMINIO_LABELS } from "@/lib/utils";
import { detectarPadroes, gerarQuestionamentos } from "@/lib/padroes";
import { Evento, Projeto } from "@/types";
export default async function DashboardPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const [{data:eventos},{data:projetos}]=await Promise.all([supabase.from("eventos").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}).limit(50),supabase.from("projetos").select("*").eq("user_id",user!.id).eq("status","ativo").order("created_at",{ascending:false}).limit(5)]);
  const eventosList=(eventos??[]) as Evento[]; const projetosList=(projetos??[]) as Projeto[];
  const padroes=detectarPadroes(eventosList); const questionamentos=gerarQuestionamentos(eventosList);
  const ultimosEventos=eventosList.slice(0,4);
  const firstName=user!.email?.split("@")[0]??"usuário";
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto page-enter">
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Olá, {firstName} 👋</h1><p className="text-zinc-500 text-sm mt-1">{eventosList.length===0?"Comece registrando seu primeiro evento.":`${eventosList.length} eventos registrados. Tudo influencia tudo.`}</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[{label:"Eventos",value:eventosList.length,icon:Zap,color:"text-darwin-400"},{label:"Projetos ativos",value:projetosList.length,icon:FolderKanban,color:"text-emerald-400"},{label:"Padrões detectados",value:padroes.length,icon:TrendingUp,color:"text-violet-400"},{label:"Esta semana",value:eventosList.filter(e=>{const d=new Date(e.created_at);const diff=(new Date().getTime()-d.getTime())/(1000*60*60*24);return diff<=7;}).length,icon:Zap,color:"text-amber-400"}].map(({label,value,icon:Icon,color})=>(
          <div key={label} className="card p-4"><div className="flex items-center gap-2 mb-2"><Icon size={14} className={color}/><span className="text-xs text-zinc-500">{label}</span></div><p className="text-2xl font-bold text-white">{value}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-zinc-300">Últimos eventos</h2><Link href="/dashboard/eventos" className="text-xs text-darwin-400 hover:text-darwin-300 flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link></div>
          {ultimosEventos.length===0?(<div className="text-center py-6"><p className="text-zinc-600 text-sm">Nenhum evento ainda.</p><Link href="/dashboard/eventos" className="btn-primary inline-flex items-center gap-1 mt-3 text-xs"><Plus size={12}/>Registrar evento</Link></div>):(<div className="space-y-2">{ultimosEventos.map(ev=>(<div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0e0f1a] border border-[rgba(99,113,242,0.08)]"><div className="w-1.5 h-1.5 rounded-full bg-darwin-500 mt-1.5 flex-shrink-0"/><div className="min-w-0 flex-1"><p className="text-sm text-zinc-200 font-medium truncate">{ev.titulo}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-zinc-600">{TIPO_EVENTO_LABELS[ev.tipo]}</span>{ev.emocao&&<span className="text-xs text-zinc-600">· {ev.emocao}</span>}</div></div></div>))}</div>)}
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Questionamentos reflexivos</h2>
          {questionamentos.length===0?(<p className="text-zinc-600 text-sm text-center py-6">Registre mais eventos para gerar questionamentos.</p>):(<div className="space-y-3">{questionamentos.map((q,i)=>(<div key={i} className="flex gap-3 p-3 rounded-lg bg-darwin-600/5 border border-darwin-500/10"><span className="text-darwin-500 text-xs font-mono mt-0.5 flex-shrink-0">0{i+1}</span><p className="text-sm text-zinc-400 leading-relaxed">{q}</p></div>))}</div>)}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-zinc-300">Padrões detectados</h2><Link href="/dashboard/padroes" className="text-xs text-darwin-400 hover:text-darwin-300 flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link></div>
          {padroes.length===0?(<p className="text-zinc-600 text-sm text-center py-6">Registre pelo menos 3 eventos para detectar padrões.</p>):(<div className="space-y-2">{padroes.slice(0,3).map((p,i)=>(<div key={i} className="p-3 rounded-lg bg-[#0e0f1a] border border-[rgba(99,113,242,0.08)]"><p className="text-sm text-zinc-400">{p.descricao}</p></div>))}</div>)}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-zinc-300">Projetos ativos</h2><Link href="/dashboard/projetos" className="text-xs text-darwin-400 hover:text-darwin-300 flex items-center gap-1">Ver todos <ArrowRight size={12}/></Link></div>
          {projetosList.length===0?(<div className="text-center py-6"><p className="text-zinc-600 text-sm">Nenhum projeto ativo.</p><Link href="/dashboard/projetos" className="btn-primary inline-flex items-center gap-1 mt-3 text-xs"><Plus size={12}/>Novo projeto</Link></div>):(<div className="space-y-2">{projetosList.map(proj=>(<div key={proj.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0e0f1a] border border-[rgba(99,113,242,0.08)]"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:proj.cor??"#6371f2"}}/><div className="min-w-0 flex-1"><p className="text-sm text-zinc-200 font-medium truncate">{proj.nome}</p>{proj.dominio&&<p className="text-xs text-zinc-600">{DOMINIO_LABELS[proj.dominio]}</p>}</div>{proj.progresso!==undefined&&<span className="text-xs text-zinc-500">{proj.progresso}%</span>}</div>))}</div>)}
        </div>
      </div>
    </div>
  );
}