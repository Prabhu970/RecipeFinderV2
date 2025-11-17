import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

import { Mail, Lock, User } from "lucide-react";

export function SignupForm() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { fullname } },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Forward to profile setup after signup
    navigate("/profile-setup");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border border-neutral-800 bg-neutral-900 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Start your recipe journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullname">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Sign Up button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
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

          {/* OAuth buttons (optional, works if enabled in Supabase) */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            >
              <span className="mr-2">🌐</span>
              Google
            </Button>

            <Button
              variant="outline"
              type="button"
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })}
            >
              <span className="mr-2">🐱</span>
              GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
