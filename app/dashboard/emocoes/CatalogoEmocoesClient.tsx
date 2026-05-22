'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Search, Edit2, Check, Loader2 } from 'lucide-react';
import type { EmocaoCatalogo } from '@/types';

const CORES = ['#6e56ff','#ec4899','#22c55e','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function CatalogoEmocoesClient() {
  const supabase = createClient();
  const [emocoes, setEmocoes] = useState<EmocaoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', cor: '#6e56ff' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEmocoes(); }, []);

  async function fetchEmocoes() {
    setLoading(true);
    const { data } = await supabase.from('emocoes_catalogo').select('*').order('nome');
    setEmocoes(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.nome.trim()) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    if (editId) {
      await supabase.from('emocoes_catalogo').update({ nome: form.nome, descricao: form.descricao, cor: form.cor, updated_at: new Date().toISOString() }).eq('id', editId);
      setEditId(null);
    } else {
      await supabase.from('emocoes_catalogo').insert({ user_id: user.user.id, nome: form.nome, descricao: form.descricao, cor: form.cor });
    }
    setForm({ nome: '', descricao: '', cor: '#6e56ff' });
    setShowForm(false);
    setSaving(false);
    fetchEmocoes();
  }

  function startEdit(e: EmocaoCatalogo) {
    setEditId(e.id);
    setForm({ nome: e.nome, descricao: e.descricao||'', cor: e.cor||'#6e56ff' });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await supabase.from('emocoes_catalogo').delete().eq('id', id);
    fetchEmocoes();
  }

  const filtradas = emocoes.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Catálogo de Emoções</h1>
          <p className="text-white/50 text-sm mt-1">Expanda seu banco emocional personalizado</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ nome:'', descricao:'', cor:'#6e56ff' }); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Adicionar emoção
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">{editId ? 'Editar' : 'Nova'} emoção</h3>
          <input value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))}
            placeholder="Nome da emoção" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
          <textarea value={form.descricao} onChange={e => setForm(p=>({...p,descricao:e.target.value}))}
            placeholder="Descrição (opcional)" rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500 resize-none" />
          <div className="space-y-2">
            <label className="text-xs text-white/50">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {CORES.map(c => (
                <button key={c} type="button" onClick={() => setForm(p=>({...p,cor:c}))}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: form.cor === c ? 'white' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar emoção..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-500" size={24} /></div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p>{busca ? 'Nenhuma emoção encontrada' : 'Nenhuma emoção cadastrada ainda'}</p>
          {!busca && <p className="text-sm mt-1">Clique em &quot;Adicionar emoção&quot; para começar</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map(e => (
            <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: e.cor||'#6e56ff' }} />
                  <span className="font-medium text-white text-sm">{e.nome}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(e)} className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(e.id)} className="p-1 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors"><X size={13} /></button>
                </div>
              </div>
              {e.descricao && <p className="text-white/40 text-xs mt-2 line-clamp-2">{e.descricao}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
