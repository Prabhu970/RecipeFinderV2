import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    navigate("/profile");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          Welcome back
        </h1>
        <p className="text-center text-gray-300 mb-6">
          Enter your credentials to access your account
        </p>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-200 text-sm">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-gray-200 text-sm">Password</label>
              <span className="text-blue-400 text-sm hover:underline cursor-pointer">
                Forgot?
              </span>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition text-white text-lg font-medium shadow-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-grow h-px bg-white/20"></div>
          <span className="px-3 text-gray-300 text-sm">Or continue with</span>
          <div className="flex-grow h-px bg-white/20"></div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/20 text-white border border-white/20 hover:bg-white/30 transition">
            <span className="text-xl">G</span> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/20 text-white border border-white/20 hover:bg-white/30 transition">
            <span className="text-xl">🐙</span> GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
