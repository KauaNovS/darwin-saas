'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, FolderOpen, Clock, BarChart2, Heart, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/eventos', label: 'Eventos', icon: Zap },
  { href: '/dashboard/projetos', label: 'Projetos', icon: FolderOpen },
  { href: '/dashboard/timeline', label: 'Timeline', icon: Clock },
  { href: '/dashboard/padroes', label: 'Padrões', icon: BarChart2 },
];
const catalogos = [
  { href: '/dashboard/emocoes', label: 'Catálogo de Emoções', icon: Heart },
  { href: '/dashboard/dominios', label: 'Tipos de Domínio', icon: Globe },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-white/10 bg-black/20 flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">D</div>
          <div>
            <p className="font-semibold text-white text-sm">Darwin</p>
            <p className="text-white/40 text-xs">Sistema evolutivo</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
              pathname === href ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' : 'text-white/50 hover:text-white hover:bg-white/5')}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <div className="pt-4 pb-1">
          <p className="text-xs text-white/20 px-3 uppercase tracking-wider font-medium">Catálogos</p>
        </div>
        {catalogos.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
              pathname === href ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' : 'text-white/50 hover:text-white hover:bg-white/5')}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <form action="/auth/signout" method="post">
          <button className="w-full text-left text-white/30 hover:text-white/60 text-xs px-3 py-2 transition-colors">Sair</button>
        </form>
      </div>
    </aside>
  );
}
