'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, FolderOpen, Clock, BarChart2, Heart, Globe, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href:'/dashboard', label:'Visão Geral', icon:LayoutDashboard },
  { href:'/dashboard/eventos', label:'Registros', icon:Zap },
  { href:'/dashboard/projetos', label:'Projetos', icon:FolderOpen },
  { href:'/dashboard/timeline', label:'Timeline', icon:Clock },
  { href:'/dashboard/padroes', label:'Padrões', icon:BarChart2 },
];
const CATALOGS = [
  { href:'/dashboard/emocoes', label:'Emoções', icon:Heart },
  { href:'/dashboard/dominios', label:'Domínios', icon:Globe },
];

export default function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => href === '/dashboard' ? path === href : path.startsWith(href);
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full" style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor:'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
            style={{ background:'linear-gradient(135deg,#7b61ff,#9d87ff)', boxShadow:'0 4px 12px rgba(123,97,255,0.4)' }}>D</div>
          <div>
            <p className="text-sm font-black" style={{ color:'var(--text)', letterSpacing:'2px', textTransform:'uppercase' }}>Darwin</p>
            <p className="text-xs" style={{ color:'var(--text3)' }}>Sistema evolutivo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? 'rgba(123,97,255,0.15)' : 'transparent',
                color: active ? '#9d87ff' : 'var(--text3)',
                border: active ? '1px solid rgba(123,97,255,0.25)' : '1px solid transparent',
              }}>
              <Icon size={15} />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#7b61ff', boxShadow:'0 0 6px #7b61ff' }} />}
            </Link>
          );
        })}

        <div className="pt-3 pb-1 px-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)', letterSpacing:'0.12em' }}>Catálogos</p>
        </div>
        {CATALOGS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? 'rgba(123,97,255,0.15)' : 'transparent',
                color: active ? '#9d87ff' : 'var(--text3)',
                border: active ? '1px solid rgba(123,97,255,0.25)' : '1px solid transparent',
              }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor:'var(--border)' }}>
        <form action="/auth/signout" method="post">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color:'var(--text3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <LogOut size={15} /> Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
