'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Edit2, Check, Loader2, ChevronDown } from 'lucide-react';
import { DOMINIOS } from '@/lib/utils';
import type { DominioTipo } from '@/types';

export default function CatalogoDominiosClient() {
  const supabase = createClient();
  const [tipos, setTipos] = useState<DominioTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDominio, setFiltroDominio] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', dominio: '', identificador: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTipos(); }, []);

  async function fetchTipos() {
    setLoading(true);
    const { data } = await supabase.from('dominio_tipos').select('*').order('dominio').order('nome');
    setTipos(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.dominio) return;
    setSaving(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const identificador = form.identificador || form.nome.toLowerCase().replace(/\s+/g,'-');
    if (editId) {
      await supabase.from('dominio_tipos').update({ nome: form.nome, descricao: form.descricao, dominio: form.dominio, identificador, updated_at: new Date().toISOString() }).eq('id', editId);
      setEditId(null);
    } else {
      await supabase.from('dominio_tipos').insert({ user_id: user.user.id, nome: form.nome, descricao: form.descricao, dominio: form.dominio, identificador });
    }
    setForm({ nome:'', descricao:'', dominio:'', identificador:'' });
    setShowForm(false); setSaving(false);
    fetchTipos();
  }

  function startEdit(t: DominioTipo) {
    setEditId(t.id);
    setForm({ nome: t.nome, descricao: t.descricao||'', dominio: t.dominio, identificador: t.identificador });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await supabase.from('dominio_tipos').delete().eq('id', id);
    fetchTipos();
  }

  const dominioLabel = (val: string) => DOMINIOS.find(d => d.value === val)?.label || val;
  const filtrados = filtroDominio ? tipos.filter(t => t.dominio === filtroDominio) : tipos;
  const porDominio = filtrados.reduce((acc, t) => {
    if (!acc[t.dominio]) acc[t.dominio] = [];
    acc[t.dominio].push(t);
    return acc;
  }, {} as Record<string, DominioTipo[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tipos de Domínio</h1>
          <p className="text-white/50 text-sm mt-1">Gerencie os tipos de domínio do Darwin</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({nome:'',descricao:'',dominio:'',identificador:''}); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Novo tipo
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">{editId ? 'Editar' : 'Novo'} tipo de domínio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))}
              placeholder="Nome do tipo *" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500" />
            <select value={form.dominio} onChange={e => setForm(p=>({...p,dominio:e.target.value}))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
              <option value="">Selecionar domínio *</option>
              {DOMINIOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <input value={form.identificador} onChange={e => setForm(p=>({...p,identificador:e.target.value}))}
              placeholder="Identificador (auto-gerado)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500" />
            <textarea value={form.descricao} onChange={e => setForm(p=>({...p,descricao:e.target.value}))}
              placeholder="Descrição (opcional)" rows={1}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltroDominio('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filtroDominio ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
          Todos
        </button>
        {DOMINIOS.map(d => (
          <button key={d.value} onClick={() => setFiltroDominio(d.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtroDominio===d.value ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
      ) : Object.keys(porDominio).length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p>Nenhum tipo cadastrado ainda</p>
          <p className="text-sm mt-1">Clique em &quot;Novo tipo&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porDominio).map(([dom, itens]) => (
            <div key={dom}>
              <h3 className="text-sm font-semibold text-white/60 mb-3">{dominioLabel(dom)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {itens.map(t => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white text-sm">{t.nome}</p>
                        <p className="text-white/30 text-xs mt-0.5 font-mono">{t.identificador}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(t)} className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors"><X size={13} /></button>
                      </div>
                    </div>
                    {t.descricao && <p className="text-white/40 text-xs mt-2 line-clamp-2">{t.descricao}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
