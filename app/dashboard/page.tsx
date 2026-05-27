import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

const CAT: Record<string,{emoji:string;color:string;bg:string;label:string}> = {
  emocao:       { emoji:'💜', color:'#7b61ff', bg:'rgba(123,97,255,0.12)', label:'Emoção' },
  pensamento:   { emoji:'🧠', color:'#38bdf8', bg:'rgba(56,189,248,0.12)', label:'Pensamento' },
  sensacao:     { emoji:'🌊', color:'#fb923c', bg:'rgba(251,146,60,0.12)', label:'Sensação' },
  comportamento:{ emoji:'🔄', color:'#ef4444', bg:'rgba(239,68,68,0.12)',  label:'Comportamento' },
  evento:       { emoji:'📌', color:'#f472b6', bg:'rgba(244,114,182,0.12)',label:'Evento' },
  atividade:    { emoji:'⚡', color:'#2dd4bf', bg:'rgba(45,212,191,0.12)', label:'Atividade' },
  sono:         { emoji:'🌙', color:'#818cf8', bg:'rgba(129,140,248,0.12)',label:'Sono' },
  memoria:      { emoji:'🕰️', color:'#f9a8d4', bg:'rgba(249,168,212,0.12)',label:'Memória' },
};

function fmtTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'agora';
  if (m < 60) return m+'min';
  const h = Math.floor(m/60);
  if (h < 24) return h+'h atrás';
  return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: registros } = await supabase
    .from('registros').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending:false })
    .limit(20);

  const regs = registros || [];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nome = user.email?.split('@')[0] || 'você';

  const countByTipo = regs.reduce((acc: Record<string,number>, r) => {
    acc[r.categoria as string] = (acc[r.categoria as string] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className='space-y-10'>
      <div className='pt-2'>
        <p className='text-sm' style={{ color:'var(--text3)' }}>{saudacao}</p>
        <h1 className='text-3xl font-black mt-0.5' style={{ color:'var(--text)' }}>{nome}</h1>
      </div>

      <Link href='/registrar'
        className='flex items-center justify-center gap-3 py-5 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]'
        style={{ background:'var(--accent)', color:'#fff', boxShadow:'0 8px 30px rgba(123,97,255,0.4)', display:'flex' }}>
        <Plus size={20} />
        Registrar agora
      </Link>

      {regs.length > 0 && (
        <div>
          <p className='text-xs font-bold uppercase tracking-widest mb-4' style={{ color:'var(--text3)' }}>
            Hoje
          </p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(countByTipo).map(([tipo, count]) => {
              const c = CAT[tipo]; if (!c) return null;
              return (
                <div key={tipo} className='flex items-center gap-2 px-3 py-2 rounded-xl'
                  style={{ background:c.bg, border:`1px solid ${c.color}30` }}>
                  <span>{c.emoji}</span>
                  <span className='text-sm font-bold' style={{ color:c.color }}>{count}</span>
                  <span className='text-xs' style={{ color:c.color+'99' }}>{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className='flex items-center justify-between mb-4'>
          <p className='text-xs font-bold uppercase tracking-widest' style={{ color:'var(--text3)' }}>Registros</p>
          {regs.length > 5 && (
            <Link href='/dashboard/eventos' className='flex items-center gap-1 text-xs' style={{ color:'var(--text3)' }}>
              Ver todos <ArrowRight size={11} />
            </Link>
          )}
        </div>

        {regs.length === 0 ? (
          <div className='text-center py-16 space-y-3'>
            <p className='text-4xl'>🌱</p>
            <p className='font-semibold' style={{ color:'var(--text2)' }}>Nenhum registro ainda</p>
            <p className='text-sm' style={{ color:'var(--text3)' }}>Toque em Registrar agora para começar</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {regs.slice(0,10).map((reg) => {
              const cat = CAT[reg.categoria as string] || CAT.emocao;
              const itens = ((reg.meta as Record<string,unknown>)?.itens as string[]) || [];
              const iv = reg.intensidade as number;
              const intColor = iv <= 3 ? '#ef4444' : iv <= 6 ? '#f59e0b' : '#22c55e';
              return (
                <div key={reg.id as string}
                  className='flex items-center gap-4 p-4 rounded-2xl'
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                  <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0' style={{ background:cat.bg }}>
                    {cat.emoji}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold truncate' style={{ color:'var(--text)' }}>
                      {itens.length > 0 ? itens.slice(0,2).join(' · ') : (reg.titulo as string) || cat.label}
                    </p>
                    <p className='text-xs mt-0.5' style={{ color:cat.color }}>
                      {cat.label}
                      {(reg.adaptativo as boolean) === true && ' · ↑ adaptativo'}
                      {(reg.adaptativo as boolean) === false && ' · ↓ desadaptativo'}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                    {iv && <span className='text-sm font-black' style={{ color:intColor }}>{iv}</span>}
                    <span className='text-xs' style={{ color:'var(--text3)' }}>{fmtTime(reg.created_at as string)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}