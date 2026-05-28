import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

const CAT_META: Record<string,{ emoji:string; label:string; color:string }> = {
  emocao:        { emoji:'💜', label:'Emoção',        color:'#7b61ff' },
  pensamento:    { emoji:'🧠', label:'Pensamento',    color:'#38bdf8' },
  comportamento: { emoji:'🔄', label:'Comportamento', color:'#ef4444' },
  evento:        { emoji:'📌', label:'Evento',        color:'#f472b6' },
  atividade:     { emoji:'⚡', label:'Atividade',     color:'#2dd4bf' },
  sono:          { emoji:'🌙', label:'Sono',          color:'#818cf8' },
  memoria:       { emoji:'🕰️', label:'Memória',      color:'#f9a8d4' },
  sensacao:      { emoji:'🌊', label:'Sensação',      color:'#fb923c' },
};

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return m + 'min';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: registros } = await supabase
    .from('registros').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(8);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nome = user.email?.split('@')[0] || 'você';
  const regs = registros || [];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 48, paddingBottom: 48 }}>

      {/* Greeting */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>{saudacao},</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{nome}</h1>
      </div>

      {/* Botão principal de registro */}
      <Link href="/dashboard/registrar"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '20px 24px', borderRadius: 18, background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none', marginBottom: 48, transition: 'opacity 0.15s' }}
        onMouseEnter={undefined}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Novo registro</p>
            <p style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>Emoção, pensamento, evento...</p>
          </div>
        </div>
        <ArrowRight size={18} style={{ opacity: 0.5 }} />
      </Link>

      {/* Últimos registros */}
      {regs.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recentes</p>
            <Link href="/dashboard/eventos" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {regs.map((reg: Record<string,unknown>) => {
              const cat = CAT_META[reg.categoria as string] || CAT_META.emocao;
              const meta = (reg.meta as Record<string,unknown>) || {};
              const sels = (meta.sels as string[]) || [];
              const titulo = (reg.titulo as string) || sels[0] || cat.label;
              return (
                <div key={reg.id as string}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titulo}</p>
                    {sels.length > 1 && (
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sels.slice(1,3).join(', ')}{sels.length > 3 ? ' +' + (sels.length-3) : ''}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {(reg.intensidade as number) && <p style={{ fontSize: 13, fontWeight: 700, color: (reg.intensidade as number) <= 3 ? '#ef4444' : (reg.intensidade as number) <= 6 ? '#f59e0b' : '#22c55e' }}>{reg.intensidade as number}</p>}
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{fmtTime(reg.created_at as string)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {regs.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>
            Nenhum registro ainda.<br />
            Clique em <strong style={{ color: 'var(--text2)' }}>Novo registro</strong> para começar.
          </p>
        </div>
      )}
    </div>
  );
}
