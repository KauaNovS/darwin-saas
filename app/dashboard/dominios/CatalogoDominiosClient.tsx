"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, X, Search, Edit2, Trash2, Layers } from "lucide-react";
import { DOMINIO_LABELS, DOMINIO_CORES } from "@/lib/utils";
import { DominioEvolutivo } from "@/types";

const DOMINIOS: DominioEvolutivo[] = ["cientifico","estrategico","fisico","social","criativo","mental","financeiro","espiritual"];
interface Tipo { id: string; nome: string; descricao?: string; dominio: DominioEvolutivo; identificador?: string; }

export default function CatalogoDominiosClient({ tipos }: { tipos: Tipo[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [filtroDominio, setFiltroDominio] = useState<DominioEvolutivo|"">("");
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter(); const supabase = createClient();
  const emptyForm = { nome: "", descricao: "", dominio: "mental" as DominioEvolutivo, identificador: "" };
  const [form, setForm] = useState(emptyForm);

  const filtered = tipos.filter(t => {
    const matchSearch = t.nome.toLowerCase().includes(search.toLowerCase());
    const matchDominio = filtroDominio === "" || t.dominio === filtroDominio;
    return matchSearch && matchDominio;
  });

  function startEdit(t: Tipo) { setForm({ nome:t.nome, descricao:t.descricao||"", dominio:t.dominio, identificador:t.identificador||"" }); setEditingId(t.id); setShowForm(true); }
  function resetForm() { setForm(emptyForm); setEditingId(null); setShowForm(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, identificador: form.identificador || form.nome.toLowerCase().replace(/s+/g,"-") };
    if (editingId) { await supabase.from("dominio_tipos").update(payload).eq("id", editingId); }
    else { await supabase.from("dominio_tipos").insert({ ...payload, user_id: user!.id }); }
    resetForm(); startTransition(() => router.refresh()); setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("dominio_tipos").delete().eq("id", id);
    startTransition(() => router.refresh());
  }

  const grouped = DOMINIOS.reduce((acc, d) => { acc[d] = filtered.filter(t => t.dominio === d); return acc; }, {} as Record<DominioEvolutivo, Tipo[]>);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white flex items-center gap-2"><Layers size={18} className="text-violet-400"/>Tipos de Domínio</h1><p className="text-zinc-500 text-sm mt-0.5">{tipos.length} tipos cadastrados</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15}/>Novo tipo</button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"/><input className="input pl-9" placeholder="Buscar tipo..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <select className="select w-auto min-w-[140px]" value={filtroDominio} onChange={e => setFiltroDominio(e.target.value as DominioEvolutivo|"")}>
          <option value="">Todos os domínios</option>
          {DOMINIOS.map(d => <option key={d} value={d}>{DOMINIO_LABELS[d]}</option>)}
        </select>
      </div>

      {filtered.length === 0 && <div className="card p-10 text-center"><Layers size={32} className="text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500">Nenhum tipo encontrado.</p><button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-1.5"><Plus size={14}/>Criar primeiro tipo</button></div>}

      <div className="space-y-6">
        {DOMINIOS.map(d => grouped[d].length > 0 && (
          <div key={d}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${DOMINIO_CORES[d]}`}>{DOMINIO_LABELS[d]}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {grouped[d].map(t => (
                <div key={t.id} className="card-hover p-4 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-200">{t.nome}</p>
                      {t.identificador && <p className="text-xs text-zinc-700 font-mono mt-0.5">{t.identificador}</p>}
                      {t.descricao && <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{t.descricao}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => startEdit(t)} className="btn-ghost p-1.5"><Edit2 size={12}/></button>
                      <button onClick={() => handleDelete(t.id)} className="btn-ghost p-1.5 hover:text-rose-400"><Trash2 size={12}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(99,113,242,0.1)]"><h2 className="text-sm font-semibold text-white">{editingId?"Editar tipo":"Novo tipo de domínio"}</h2><button onClick={resetForm} className="btn-ghost p-1"><X size={16}/></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="label">Nome *</label><input className="input" placeholder="Ex: Foco, Comunicação..." required value={form.nome} onChange={e => setForm({...form,nome:e.target.value})}/></div>
              <div><label className="label">Domínio relacionado</label><select className="select" value={form.dominio} onChange={e => setForm({...form,dominio:e.target.value as DominioEvolutivo})}>{DOMINIOS.map(d=><option key={d} value={d}>{DOMINIO_LABELS[d]}</option>)}</select></div>
              <div><label className="label">Identificador interno</label><input className="input font-mono" placeholder="foco, comunicacao..." value={form.identificador} onChange={e => setForm({...form,identificador:e.target.value})}/></div>
              <div><label className="label">Descrição</label><textarea className="input min-h-[70px] resize-none" placeholder="Descreva este tipo de domínio..." value={form.descricao} onChange={e => setForm({...form,descricao:e.target.value})}/></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button><button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">{loading?"Salvando...":editingId?"Salvar":"Criar"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}