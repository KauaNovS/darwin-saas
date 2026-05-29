'use client';
import Link from 'next/link';
import { ArrowRight, Plus, Flame } from 'lucide-react';

const CAT: Record<string, { emoji: string; label: string }> = {
  emocao:        { emoji:'💜', label:'Emoção' },
  pensamento:    { emoji:'🧠', label:'Pensamento' },
  comportamento: { emoji:'🔄', label:'Comportamento' },
  evento:        { emoji:'📌', label:'Evento' },
  atividade:     { emoji:'⚡', label:'Atividade' },
  sono:          { emoji:'🌙', label:'Sono' },
  memoria:       { emoji:'🕰️', label:'Memória' },
  sensacao:      { emoji:'🌊', label:'Sensação' },
};

function fmtTime(dateStr: string) {
  const d = new Date(dateStr), diff = Date.now() - d.getTime(), m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return m + 'min';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface Reg {
  id: string; categoria: string; titulo: string;
  intensidade: number; created_at: string;
  meta?: { sels?: string[] };
}

interface Props {
  nome: string; saudacao: string; streak: number;
  insight: string | null; registros: Reg[];
  totalRegistros: number; projetosCount: number;
}

export default function DashboardHome({ nome, saudacao, streak, insight, registros, totalRegistros, projetosCount }: Props) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 40, paddingBottom: 64 }}>

      {/* Greeting + streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>{saudacao},</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{nome}</h1>
        </div>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Flame size={14} style={{ color: '#f97316' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>{streak}</span>
          </div>
        )}
      </div>

      {/* Insight */}
      {insight && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 28, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
          {insight}
        </div>
      )}

      {/* CTA principal */}
      <Link href="/dashboard/registrar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 22px', borderRadius: 18, textDecoration: 'none',
        background: 'var(--text)', color: 'var(--bg)', marginBottom: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Novo registro</p>
            <p style={{ fontSize: 12, opacity: 0.55, margin: '2px 0 0' }}>Emoção, pensamento, evento...</p>
          </div>
        </div>
        <ArrowRight size={16} style={{ opacity: 0.4 }} />
      </Link>

      {/* Stats mini */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 36 }}>
        {[
          { label: 'Total de registros', value: totalRegistros },
          { label: 'Projetos ativos', value: projetosCount },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Registros recentes */}
      {registros.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Recentes</p>
            <Link href="/dashboard/eventos" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {registros.map(reg => {
              const cat = CAT[reg.categoria] || CAT.emocao;
              const sels = reg.meta?.sels || [];
              const titulo = reg.titulo || sels[0] || cat.label;
              const intColor = reg.intensidade <= 3 ? '#ef4444' : reg.intensidade <= 6 ? '#f59e0b' : '#22c55e';
              return (
                <div key={reg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titulo}</p>
                    {sels.length > 1 && (
                      <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0' }}>
                        {sels.slice(0, 3).join(' · ')}{sels.length > 3 ? ` +${sels.length - 3}` : ''}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {reg.intensidade > 0 && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: intColor, margin: 0 }}>{reg.intensidade}</p>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>{fmtTime(reg.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {registros.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, margin: 0 }}>
            Nenhum registro ainda.<br />
            Clique em <strong style={{ color: 'var(--text2)', fontWeight: 700 }}>Novo registro</strong> para começar.
          </p>
        </div>
      )}
    </div>
  );
}
