import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";

import { Mail, Lock } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border border-neutral-800 bg-neutral-900 text-white">
        
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-blue-500 text-sm hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-neutral-900 px-2 text-neutral-500 text-sm">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">

            {/* Google */}
            <Button
              variant="outline"
              type="button"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09A6.72 6.72 0 015.49 12c0-.72.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.92 11.92 0 0012 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.7 7.37 9.13 5.38 12 5.38z" />
              </svg>
              Google
            </Button>

            {/* GitHub */}
            <Button
              variant="outline"
              type="button"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.38-3.88-1.38-.53-1.37-1.3-1.73-1.3-1.73-1.07-.74.08-.72.08-.72 1.18.08 1.8 1.22 1.8 1.22 1.05 1.82 2.75 1.3 3.42.99.11-.75.42-1.29.77-1.59-2.56-.29-5.26-1.29-5.26-5.75 0-1.27.46-2.32 1.22-3.14-.12-.3-.53-1.52.11-3.17 0 0 .99-.32 3.24 1.23a11.3 11.3 0 012.95-.4c1 0 2.02.14 2.97.4 2.24-1.55 3.22-1.23 3.22-1.23.64 1.65.25 2.87.13 3.17.76.82 1.22 1.87 1.22 3.14 0 4.48-2.71 5.45-5.29 5.74.42.36.82 1.09.82 2.2v3.27c0 .31.19.68.8.56A10.99 10.99 0 0023.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
              </svg>
              GitHub
            </Button>

          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-neutral-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>

      </Card>
    </div>
  );
}
