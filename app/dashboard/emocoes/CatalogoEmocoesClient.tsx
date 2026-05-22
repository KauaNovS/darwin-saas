"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, X, Search, Edit2, Trash2, Heart } from "lucide-react";

interface Emocao { id: string; nome: string; descricao?: string; cor?: string; }

export default function CatalogoEmocoesClient({ emocoes }: { emocoes: Emocao[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter(); const supabase = createClient();
  const emptyForm = { nome: "", descricao: "", cor: "#6371f2" };
  const [form, setForm] = useState(emptyForm);

  const filtered = emocoes.filter(e => e.nome.toLowerCase().includes(search.toLowerCase()) || (e.descricao||"").toLowerCase().includes(search.toLowerCase()));

  function startEdit(em: Emocao) { setForm({ nome: em.nome, descricao: em.descricao||"", cor: em.cor||"#6371f2" }); setEditingId(em.id); setShowForm(true); }
  function resetForm() { setForm(emptyForm); setEditingId(null); setShowForm(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (editingId) {
      await supabase.from("emocoes_catalogo").update({ ...form }).eq("id", editingId);
    } else {
      await supabase.from("emocoes_catalogo").insert({ ...form, user_id: user!.id });
    }
    resetForm(); startTransition(() => router.refresh()); setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("emocoes_catalogo").delete().eq("id", id);
    startTransition(() => router.refresh());
  }

  const CORES = ["#6371f2","#ec4899","#f59e0b","#22c55e","#3b82f6","#8b5cf6","#ef4444","#14b8a6"];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-white flex items-center gap-2"><Heart size={18} className="text-rose-400"/>Catálogo de Emoções</h1><p className="text-zinc-500 text-sm mt-0.5">{emocoes.length} emoções cadastradas</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15}/>Nova emoção</button>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"/>
        <input className="input pl-9" placeholder="Buscar emoção..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center"><Heart size={32} className="text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500">{search ? "Nenhuma emoção encontrada." : "Nenhuma emoção cadastrada ainda."}</p><button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-1.5"><Plus size={14}/>Adicionar primeira emoção</button></div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(em => (
          <div key={em.id} className="card-hover p-4 group">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: em.cor || "#6371f2" }}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-200">{em.nome}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(em)} className="btn-ghost p-1.5"><Edit2 size={12}/></button>
                    <button onClick={() => handleDelete(em.id)} className="btn-ghost p-1.5 hover:text-rose-400"><Trash2 size={12}/></button>
                  </div>
                </div>
                {em.descricao && <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{em.descricao}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(99,113,242,0.1)]">
              <h2 className="text-sm font-semibold text-white">{editingId ? "Editar emoção" : "Nova emoção"}</h2>
              <button onClick={resetForm} className="btn-ghost p-1"><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="label">Nome *</label><input className="input" placeholder="Ex: Alegria, Ansiedade..." required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}/></div>
              <div><label className="label">Descrição</label><textarea className="input min-h-[80px] resize-none" placeholder="Descreva esta emoção..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}/></div>
              <div><label className="label">Cor</label><div className="flex gap-2 flex-wrap">{CORES.map(cor => (<button key={cor} type="button" onClick={() => setForm({...form, cor})} className="w-7 h-7 rounded-full border-2 transition-all" style={{backgroundColor:cor,borderColor:form.cor===cor?"white":"transparent"}}/>))}</div></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button><button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">{loading?"Salvando...":editingId?"Salvar":"Criar"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}