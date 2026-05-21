"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export default function AuthPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [isLogin,setIsLogin]=useState(true); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [message,setMessage]=useState("");
  const router=useRouter(); const supabase=createClient();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(""); setMessage("");
    if (isLogin) { const {error}=await supabase.auth.signInWithPassword({email,password}); if(error){setError("Email ou senha incorretos.");}else{router.push("/dashboard");router.refresh();} }
    else { const {error}=await supabase.auth.signUp({email,password}); if(error){setError(error.message);}else{setMessage("Conta criada! Verifique seu email para confirmar.");} }
    setLoading(false);
  }
  return (
    <div className="min-h-screen bg-[#0e0f1a] bg-grid flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-darwin-600/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-darwin-600/20 border border-darwin-500/30 mb-4"><span className="text-darwin-400 font-bold text-xl">D</span></div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Darwin</h1>
          <p className="text-zinc-500 text-sm mt-1">Sistema operacional evolutivo</p>
        </div>
        <div className="card p-6">
          <div className="flex rounded-lg bg-[#0e0f1a] p-1 mb-6">
            <button onClick={()=>setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin?"bg-darwin-600 text-white":"text-zinc-500 hover:text-zinc-300"}`}>Entrar</button>
            <button onClick={()=>setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin?"bg-darwin-600 text-white":"text-zinc-500 hover:text-zinc-300"}`}>Criar conta</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Email</label><input type="email" className="input" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div><label className="label">Senha</label><input type="password" className="input" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/></div>
            {error&&<p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
            {message&&<p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{message}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">{loading?"Aguarde...":isLogin?"Entrar":"Criar conta"}</button>
          </form>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-6">Tudo influencia tudo. — Lei da Interdependência</p>
      </div>
    </div>
  );
}