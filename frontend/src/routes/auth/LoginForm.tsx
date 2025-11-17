import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardBody } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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
    <div
      style={{
        minHeight: "calc(100vh - 4rem)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "16px",
          padding: "2rem",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <CardBody>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Welcome back
          </h1>

          <p
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            Enter your credentials to access your account
          </p>

          {errorMsg && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                borderRadius: "8px",
                background: "rgba(255,0,0,0.15)",
                border: "1px solid rgba(255,0,0,0.35)",
                color: "#ffb3b3",
                fontSize: "0.9rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
            {/* EMAIL */}
            <div>
              <label style={{ fontSize: "0.9rem" }}>Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginTop: "0.3rem", marginLeft: "0.3rem" }}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.3rem",
                }}
              >
                <label style={{ fontSize: "0.9rem" }}>Password</label>
                <span
                  style={{ fontSize: "0.85rem", color: "#4ea1ff", cursor: "pointer" }}
                >
                  Forgot?
                </span>
              </div>

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              opacity: 0.85,
            }}
          >
            Don’t have an account?{" "}
            <Link to="/signup" style={{ color: "#4ea1ff" }}>
              Sign up
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
