import { useState } from "react";
import { supabase } from "src/lib/supabaseClient";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      return setErrorMsg(error.message);
    }

    if (data.user && !data.session) {
      setSuccessMsg("Account created! Please check your email to confirm.");
      return;
    }

    // Insert into public.users
    const user = data.user;

    const { error: dbError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email,
      name: username,
    });

    if (dbError) {
      return setErrorMsg("Account created, but profile setup failed.");
    }

    setSuccessMsg("Account created successfully!");
    setTimeout(() => (window.location.href = "/profile/ProfileSetup"), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="bg-gray-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Create your account
        </h1>

        {errorMsg && (
          <p className="text-red-400 text-sm mb-3 text-center">{errorMsg}</p>
        )}

        {successMsg && (
          <p className="text-green-400 text-sm mb-3 text-center">{successMsg}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="text-gray-300 text-sm">Username</label>
            <input
              type="text"
              placeholder="chef_prabhu"
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 
                       text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 
                       text-white focus:ring-2 focus:ring-emerald-400 outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 
                       text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Re-enter password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-700 
                       text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold 
                     rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-400 text-sm">Already have an account?</span>{" "}
          <a href="/login" className="text-emerald-400 text-sm hover:underline">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

