"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Zap, FolderKanban, Clock, TrendingUp, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
const NAV_ITEMS = [
  { href:"/dashboard", label:"Visão Geral", icon:LayoutDashboard },
  { href:"/dashboard/eventos", label:"Eventos", icon:Zap },
  { href:"/dashboard/projetos", label:"Projetos", icon:FolderKanban },
  { href:"/dashboard/timeline", label:"Timeline", icon:Clock },
  { href:"/dashboard/padroes", label:"Padrões", icon:TrendingUp },
];
export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname=usePathname(); const router=useRouter(); const supabase=createClient(); const [mobileOpen,setMobileOpen]=useState(false);
  async function handleLogout() { await supabase.auth.signOut(); router.push("/auth"); router.refresh(); }
  const NavContent = () => (
    <>
      <div className="px-4 pt-6 pb-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-darwin-600/20 border border-darwin-500/30 flex items-center justify-center flex-shrink-0"><span className="text-darwin-400 font-bold text-sm">D</span></div><span className="text-white font-semibold tracking-tight">Darwin</span></div></div>
      <nav className="px-3 flex-1"><div className="space-y-0.5">{NAV_ITEMS.map(({href,label,icon:Icon})=>{const active=pathname===href;return(<Link key={href} href={href} onClick={()=>setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",active?"bg-darwin-600/20 text-darwin-300 border border-darwin-500/20":"text-zinc-500 hover:text-zinc-200 hover:bg-white/5")}><Icon size={16} className={active?"text-darwin-400":""}/>{label}{active&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-darwin-400"/>}</Link>);})}</div></nav>
      <div className="px-3 pb-6 mt-auto"><div className="border-t border-[rgba(99,113,242,0.1)] pt-4"><p className="text-xs text-zinc-600 px-3 mb-2 truncate">{userEmail}</p><button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all w-full"><LogOut size={16}/>Sair</button></div></div>
    </>
  );
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-[#0a0b16] border-r border-[rgba(99,113,242,0.1)] flex-col z-40"><NavContent/></aside>
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0b16] border-b border-[rgba(99,113,242,0.1)] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-darwin-600/20 border border-darwin-500/30 flex items-center justify-center"><span className="text-darwin-400 font-bold text-xs">D</span></div><span className="text-white font-semibold text-sm">Darwin</span></div>
        <button onClick={()=>setMobileOpen(!mobileOpen)} className="btn-ghost p-2">{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button>
      </div>
      {mobileOpen&&(<div className="md:hidden fixed inset-0 z-50"><div className="absolute inset-0 bg-black/60" onClick={()=>setMobileOpen(false)}/><aside className="absolute left-0 top-0 h-full w-64 bg-[#0a0b16] border-r border-[rgba(99,113,242,0.1)] flex flex-col"><NavContent/></aside></div>)}
      <div className="md:hidden h-14"/>
    </>
  );
}