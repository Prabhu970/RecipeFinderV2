import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword)
      return setErrorMsg("Passwords do not match.");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) return setErrorMsg(error.message);

    setSuccessMsg("Account created! Check your email to confirm.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1222] px-4">
      <div className="w-full max-w-md bg-[#0f162b] p-8 rounded-xl shadow-xl border border-white/10">

        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create your account
        </h2>

        {errorMsg && (
          <div className="mb-4 text-red-400 text-sm bg-red-950/40 p-3 rounded-md border border-red-700/40">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-green-400 text-sm bg-green-950/40 p-3 rounded-md border border-green-700/40">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label className="text-gray-300 text-sm">Username</label>
            <input
              type="text"
              className="mt-1 w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-500/40 outline-none transition"
              placeholder="chef_prabhu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              className="mt-1 w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-500/40 outline-none transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-500/40 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Re-enter password</label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-500/40 outline-none transition"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-500 hover:bg-green-400 transition text-black font-semibold rounded-md shadow-md hover:shadow-green-500/40"
          >
            Sign up
          </button>
        </form>

        <div className="mt-5 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Log in
          </a>
        </div>

      </div>
    </div>
  );
}
