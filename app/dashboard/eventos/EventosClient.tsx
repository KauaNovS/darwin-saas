"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, X, Zap, Filter, Trash2, ChevronDown } from "lucide-react";
import { TIPO_EVENTO_LABELS, TIPO_EVENTO_CORES, EMOCOES_DEFAULT, DOMINIO_LABELS, DOMINIO_TIPOS_DEFAULT, cn, getIntensityColor } from "@/lib/utils";
import { Evento, EventoTipo, DominioEvolutivo, EmocaoItem, DominioItem } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPOS: EventoTipo[] = ["emocional","social","cognitivo","operacional","biologico","financeiro"];
const DOMINIOS: DominioEvolutivo[] = ["cientifico","estrategico","fisico","social","criativo","mental","financeiro","espiritual"];
interface ProjetoSimples { id:string; nome:string; cor?:string|null; }

export default function EventosClient({ eventos, projetos }: { eventos:Evento[]; projetos:ProjetoSimples[]; }) {
  const [showForm,setShowForm]=useState(false);
  const [filtroTipo,setFiltroTipo]=useState<EventoTipo|"">("");
  const [loading,setLoading]=useState(false);
  const [,startTransition]=useTransition();
  const router=useRouter(); const supabase=createClient();

  const [form,setForm]=useState({
    titulo:"",descricao:"",tipo:"emocional" as EventoTipo,energia:5,local:"",projeto_id:"",
  });
  const [emocoes,setEmocoes]=useState<EmocaoItem[]>([]);
  const [dominios,setDominios]=useState<DominioItem[]>([]);

  const eventosFiltrados=filtroTipo?eventos.filter(e=>e.tipo===filtroTipo):eventos;

  function resetForm(){
    setForm({titulo:"",descricao:"",tipo:"emocional",energia:5,local:"",projeto_id:""});
    setEmocoes([]); setDominios([]); setShowForm(false);
  }

  function addEmocao(){setEmocoes(prev=>[...prev,{emocao_nome:"",intensidade:5,observacao:""}]);}
  function updateEmocao(i:number,field:keyof EmocaoItem,val:string|number){setEmocoes(prev=>prev.map((e,idx)=>idx===i?{...e,[field]:val}:e));}
  function removeEmocao(i:number){setEmocoes(prev=>prev.filter((_,idx)=>idx!==i));}

  function addDominio(){setDominios(prev=>[...prev,{dominio:"mental" as DominioEvolutivo,tipo_nome:"",intensidade:5,descricao:""}]);}
  function updateDominio(i:number,field:keyof DominioItem,val:string|number){setDominios(prev=>prev.map((d,idx)=>idx===i?{...d,[field]:val}:d));}
  function removeDominio(i:number){setDominios(prev=>prev.filter((_,idx)=>idx!==i));}

  async function handleCreate(e:React.FormEvent){
    e.preventDefault(); setLoading(true);
    const {data:{user}}=await supabase.auth.getUser();
    const {data:evento,error}=await supabase.from("eventos").insert({
      ...form, user_id:user!.id,
      projeto_id:form.projeto_id||null, local:form.local||null, descricao:form.descricao||null,
      emocao: emocoes.length>0?emocoes.map(e=>e.emocao_nome).join(", "):null,
    }).select().single();
    if(!error && evento){
      if(emocoes.length>0){
        await supabase.from("evento_emocoes").insert(emocoes.filter(e=>e.emocao_nome).map(e=>({...e,evento_id:evento.id,user_id:user!.id})));
      }
      if(dominios.length>0){
        await supabase.from("evento_dominios").insert(dominios.map(d=>({...d,evento_id:evento.id,user_id:user!.id})));
      }
      resetForm(); startTransition(()=>router.refresh());
    }
    setLoading(false);
  }

  async function handleDelete(id:string){
    await supabase.from("evento_emocoes").delete().eq("evento_id",id);
    await supabase.from("evento_dominios").delete().eq("evento_id",id);
    await supabase.from("eventos").delete().eq("id",id);
    startTransition(()=>router.refresh());
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white flex items-center gap-2"><Zap size={18} className="text-darwin-400"/>Eventos</h1><p className="text-zinc-500 text-sm mt-0.5">{eventos.length} registros</p></div>
        <button onClick={()=>setShowForm(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15}/>Novo evento</button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter size={13} className="text-zinc-600"/>
        <button onClick={()=>setFiltroTipo("")} className={cn("badge border cursor-pointer text-xs px-2.5 py-1",filtroTipo===""?"bg-darwin-600/20 text-darwin-300 border-darwin-500/30":"bg-transparent text-zinc-600 border-zinc-700")}>Todos</button>
        {TIPOS.map(t=>(<button key={t} onClick={()=>setFiltroTipo(filtroTipo===t?"":t)} className={cn("badge border cursor-pointer text-xs px-2.5 py-1",filtroTipo===t?TIPO_EVENTO_CORES[t]:"bg-transparent text-zinc-600 border-zinc-700")}>{TIPO_EVENTO_LABELS[t]}</button>))}
      </div>

      <div className="space-y-2">
        {eventosFiltrados.length===0&&<div className="card p-10 text-center"><Zap size={32} className="text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500">Nenhum evento encontrado.</p><button onClick={()=>setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-1.5"><Plus size={14}/>Registrar evento</button></div>}
        {eventosFiltrados.map(ev=>{
          const proj=projetos.find(p=>p.id===ev.projeto_id);
          return(<div key={ev.id} className="card-hover p-4 group"><div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-darwin-500 mt-2 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">{ev.titulo}</p>
                <button onClick={()=>handleDelete(ev.id)} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-rose-400 transition-all"><Trash2 size={13}/></button>
              </div>
              {ev.descricao&&<p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">{ev.descricao}</p>}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className={cn("badge text-xs",TIPO_EVENTO_CORES[ev.tipo])}>{TIPO_EVENTO_LABELS[ev.tipo]}</span>
                {ev.emocao&&<span className="text-xs text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-full">{ev.emocao}</span>}
                {ev.energia!==undefined&&<span className="text-xs text-zinc-600">⚡ {ev.energia}/10</span>}
                {proj&&<span className="flex items-center gap-1 text-xs text-zinc-600"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{backgroundColor:proj.cor??"#6371f2"}}/>{proj.nome}</span>}
                <span className="text-xs text-zinc-700 ml-auto">{format(new Date(ev.created_at),"dd MMM, HH:mm",{locale:ptBR})}</span>
              </div>
            </div>
          </div></div>);
        })}
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(99,113,242,0.1)]">
              <h2 className="text-sm font-semibold text-white">Novo evento</h2>
              <button onClick={resetForm} className="btn-ghost p-1"><X size={16}/></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-5">
              {/* Básico */}
              <div><label className="label">Título *</label><input className="input" placeholder="O que aconteceu?" required value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/></div>
              <div><label className="label">Descrição</label><textarea className="input min-h-[70px] resize-none" placeholder="Descreva o contexto..." value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Tipo *</label><select className="select" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value as EventoTipo})}>{TIPOS.map(t=><option key={t} value={t}>{TIPO_EVENTO_LABELS[t]}</option>)}</select></div>
                <div><label className="label">Local</label><input className="input" placeholder="Casa, trabalho..." value={form.local} onChange={e=>setForm({...form,local:e.target.value})}/></div>
              </div>

              {/* Energia */}
              <div>
                <label className="label flex items-center justify-between"><span>Energia geral</span><span style={{color:getIntensityColor(form.energia)}} className="font-bold text-sm">{form.energia}/10</span></label>
                <input type="range" min="1" max="10" value={form.energia} onChange={e=>setForm({...form,energia:Number(e.target.value)})} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{accentColor:getIntensityColor(form.energia)}}/>
                <div className="h-1.5 mt-1 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${(form.energia/10)*100}%`,backgroundColor:getIntensityColor(form.energia)}}/></div>
              </div>

              {/* EMOÇÕES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Emoções</label>
                  <button type="button" onClick={addEmocao} className="btn-ghost text-xs flex items-center gap-1 text-darwin-400"><Plus size={12}/>Adicionar emoção</button>
                </div>
                {emocoes.length===0&&<p className="text-xs text-zinc-600 italic">Nenhuma emoção adicionada. Clique em "+ Adicionar emoção".</p>}
                {emocoes.map((em,i)=>(
                  <div key={i} className="bg-[#0e0f1a] border border-[rgba(99,113,242,0.15)] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-400">Emoção {i+1}</span>
                      <button type="button" onClick={()=>removeEmocao(i)} className="text-zinc-700 hover:text-rose-400 transition-colors"><X size={13}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Nome da emoção</label>
                        <select className="select" value={em.emocao_nome} onChange={e=>updateEmocao(i,"emocao_nome",e.target.value)}>
                          <option value="">Selecione...</option>
                          {EMOCOES_DEFAULT.map(e=><option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label flex justify-between"><span>Intensidade</span><span style={{color:getIntensityColor(em.intensidade)}} className="font-bold">{em.intensidade}/10</span></label>
                        <input type="range" min="1" max="10" value={em.intensidade} onChange={e=>updateEmocao(i,"intensidade",Number(e.target.value))} className="w-full cursor-pointer" style={{accentColor:getIntensityColor(em.intensidade)}}/>
                        <div className="h-1.5 mt-1 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${(em.intensidade/10)*100}%`,backgroundColor:getIntensityColor(em.intensidade)}}/></div>
                      </div>
                    </div>
                    <div><label className="label">Observação (opcional)</label><input className="input" placeholder="Contexto desta emoção..." value={em.observacao||""} onChange={e=>updateEmocao(i,"observacao",e.target.value)}/></div>
                  </div>
                ))}
              </div>

              {/* DOMÍNIOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Domínios</label>
                  <button type="button" onClick={addDominio} className="btn-ghost text-xs flex items-center gap-1 text-violet-400"><Plus size={12}/>Adicionar domínio</button>
                </div>
                {dominios.length===0&&<p className="text-xs text-zinc-600 italic">Nenhum domínio adicionado. Clique em "+ Adicionar domínio".</p>}
                {dominios.map((dm,i)=>(
                  <div key={i} className="bg-[#0e0f1a] border border-[rgba(139,92,246,0.2)] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-violet-400">Domínio {i+1}</span>
                      <button type="button" onClick={()=>removeDominio(i)} className="text-zinc-700 hover:text-rose-400 transition-colors"><X size={13}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Domínio</label>
                        <select className="select" value={dm.dominio} onChange={e=>updateDominio(i,"dominio",e.target.value as DominioEvolutivo)}>
                          {DOMINIOS.map(d=><option key={d} value={d}>{DOMINIO_LABELS[d]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Tipo</label>
                        <select className="select" value={dm.tipo_nome||""} onChange={e=>updateDominio(i,"tipo_nome",e.target.value)}>
                          <option value="">Selecione o tipo...</option>
                          {(DOMINIO_TIPOS_DEFAULT[dm.dominio]||[]).map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label flex justify-between"><span>Intensidade</span><span style={{color:getIntensityColor(dm.intensidade)}} className="font-bold">{dm.intensidade}/10</span></label>
                      <input type="range" min="1" max="10" value={dm.intensidade} onChange={e=>updateDominio(i,"intensidade",Number(e.target.value))} className="w-full cursor-pointer" style={{accentColor:getIntensityColor(dm.intensidade)}}/>
                      <div className="h-1.5 mt-1 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${(dm.intensidade/10)*100}%`,backgroundColor:getIntensityColor(dm.intensidade)}}/></div>
                    </div>
                    <div><label className="label">Descrição (opcional)</label><input className="input" placeholder="Contexto deste domínio..." value={dm.descricao||""} onChange={e=>updateDominio(i,"descricao",e.target.value)}/></div>
                  </div>
                ))}
              </div>

              {projetos.length>0&&<div><label className="label">Projeto relacionado</label><select className="select" value={form.projeto_id} onChange={e=>setForm({...form,projeto_id:e.target.value})}><option value="">Nenhum</option>{projetos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">{loading?"Salvando...":"Registrar evento"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}