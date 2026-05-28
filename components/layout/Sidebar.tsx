'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, FolderOpen, Clock, BarChart2, Heart, Globe, LogOut, Plus } from 'lucide-react';

const NAV = [
  { href:'/dashboard', label:'Início', icon:LayoutDashboard, exact:true },
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
  const isActive = (href: string, exact?: boolean) => exact ? path === href : path.startsWith(href);
  return (
    <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--bg)' }}>D</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '2px', textTransform: 'uppercase' }}>Darwin</span>
        </div>
        <Link href="/dashboard/registrar"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          <Plus size={14} /> Registrar
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10,
              fontSize: 13, fontWeight: active ? 700 : 500, textDecoration: 'none', transition: 'all 0.15s',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text3)',
            }}>
              <Icon size={15} /> {label}
            </Link>
          );
        })}

        <div style={{ padding: '16px 10px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Catálogos
        </div>
        {CATALOGS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10,
              fontSize: 13, fontWeight: active ? 700 : 500, textDecoration: 'none', transition: 'all 0.15s',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text3)',
            }}>
              <Icon size={15} /> {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <form action="/auth/signout" method="post">
          <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', width: '100%' }}>
            <LogOut size={15} /> Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
