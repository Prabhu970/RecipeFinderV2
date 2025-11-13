import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return setErrorMsg(error.message);
    window.location.href = "/"; // redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1222] px-4">
      <div className="w-full max-w-md bg-[#0f162b] p-8 rounded-xl shadow-xl border border-white/10">
        
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Log in
        </h2>

        {errorMsg && (
          <div className="mb-4 text-red-400 text-sm bg-red-950/40 p-3 rounded-md border border-red-700/40">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="
