'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, FolderOpen, BarChart2, TrendingUp, Plus } from 'lucide-react';
import QuickRegister from '@/components/registro/QuickRegister';

const CAT_META: Record<string,{ emoji:string; color:string; bg:string; label:string }> = {
  emocao:       { emoji:'💜', color:'#7b61ff', bg:'rgba(123,97,255,0.12)', label:'Emoção' },
  sensacao:     { emoji:'🌊', color:'#fb923c', bg:'rgba(251,146,60,0.12)', label:'Sensação' },
  pensamento:   { emoji:'🧠', color:'#38bdf8', bg:'rgba(56,189,248,0.12)', label:'Pensamento' },
  comportamento:{ emoji:'🔄', color:'#ef4444', bg:'rgba(239,68,68,0.12)',  label:'Comportamento' },
  evento:       { emoji:'📌', color:'#f472b6', bg:'rgba(244,114,182,0.12)',label:'Evento' },
  atividade:    { emoji:'⚡', color:'#2dd4bf', bg:'rgba(45,212,191,0.12)', label:'Atividade' },
  sono:         { emoji:'🌙', color:'#818cf8', bg:'rgba(129,140,248,0.12)',label:'Sono' },
  memoria:      { emoji:'🕰️', color:'#f9a8d4', bg:'rgba(249,168,212,0.12)',label:'Memória' },
};

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h atrás`;
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
}

interface Props {
  userName: string;
  saudacao: string;
  registros: Record<string,unknown>[];
  projetos: Record<string,unknown>[];
}

export default function DashboardClient({ userName, saudacao, registros, projetos }: Props) {
  const [localRegs, setLocalRegs] = useState(registros);

  const stats = [
    { label:'Registros', value: localRegs.length, icon:Zap, color:'#7b61ff' },
    { label:'Projetos', value: projetos.length, icon:FolderOpen, color:'#3b82f6' },
    { label:'Esta semana', value: localRegs.filter(r => new Date(r.created_at as string) > new Date(Date.now()-7*86400000)).length, icon:TrendingUp, color:'#22c55e' },
    { label:'Padrões', value: 0, icon:BarChart2, color:'#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium" style={{ color:'var(--text3)' }}>{saudacao},</p>
        <h1 className="text-3xl font-black mt-0.5" style={{ color:'var(--text)' }}>{userName} 👋</h1>
        <p className="text-sm mt-1" style={{ color:'var(--text2)' }}>O que quer registrar hoje?</p>
      </div>

      {/* Quick Register */}
      <QuickRegister onSaved={() => window.location.reload()} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon:Icon, color }) => (
          <div key={label} className="rounded-xl p-4 space-y-2" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs font-medium" style={{ color:'var(--text3)' }}>{label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color:'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Últimos registros */}
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color:'var(--text2)' }}>Últimos registros</h2>
            <Link href="/dashboard/eventos" className="flex items-center gap-1 text-xs transition-colors"
              style={{ color:'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#9d87ff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>

          {localRegs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color:'var(--text3)' }}>Nenhum registro ainda</p>
              <p className="text-xs mt-1" style={{ color:'var(--text3)' }}>Use o formulário acima para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {localRegs.slice(0,6).map((reg: Record<string,unknown>) => {
                const cat = CAT_META[reg.categoria as string] || CAT_META.emocao;
                const meta = (reg.meta as Record<string,unknown>) || {};
                const emocoes = (meta.emocoes as Array<{nome:string;intensidade:number}>) || [];
                return (
                  <div key={reg.id as string} className="flex items-start gap-3 p-3 rounded-xl transition-all"
                    style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background:cat.bg }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color:'var(--text)' }}>
                        {reg.titulo as string || cat.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium" style={{ color:cat.color }}>{cat.label}</span>
                        {(reg.intensidade as number) && (
                          <span className="text-xs" style={{ color:'var(--text3)' }}>· {reg.intensidade as number}/10</span>
                        )}
                        {emocoes.length > 0 && (
                          <span className="text-xs" style={{ color:'var(--text3)' }}>· {emocoes.length} emoção{emocoes.length>1?'ões':''}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color:'var(--text3)' }}>
                      {fmtTime(reg.created_at as string)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projetos */}
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color:'var(--text2)' }}>Projetos ativos</h2>
            <Link href="/dashboard/projetos" className="flex items-center gap-1 text-xs transition-colors"
              style={{ color:'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#9d87ff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {projetos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color:'var(--text3)' }}>Nenhum projeto ativo</p>
              <Link href="/dashboard/projetos" className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium"
                style={{ color:'#7b61ff' }}>
                <Plus size={12} /> Novo projeto
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(projetos as Record<string,unknown>[]).slice(0,4).map(proj => (
                <div key={proj.id as string} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:(proj.cor as string)||'#7b61ff' }} />
                    <p className="text-sm font-semibold flex-1 truncate" style={{ color:'var(--text)' }}>{proj.nome as string}</p>
                    <span className="text-xs font-bold" style={{ color:(proj.cor as string)||'#7b61ff' }}>{proj.progresso as number||0}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width:`${proj.progresso as number||0}%`, background:(proj.cor as string)||'#7b61ff' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
