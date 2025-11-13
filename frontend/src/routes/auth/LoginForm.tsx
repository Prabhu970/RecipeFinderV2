import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";


export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 800);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="bg-gray-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Log in
        </h1>

        {errorMsg && (
          <p className="text-red-400 text-sm mb-3 text-center">{errorMsg}</p>
        )}

        {successMsg && (
          <p className="text-green-400 text-sm mb-3 text-center">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

        </form>

        <div className="text-center mt-4">
          <a
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:underline"
          >
            Forgot your password?
          </a>
        </div>

        <div className="text-center mt-2">
          <span className="text-gray-400 text-sm">Don't have an account?</span>{" "}
          <a
            href="/signup"
            className="text-emerald-400 text-sm hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
