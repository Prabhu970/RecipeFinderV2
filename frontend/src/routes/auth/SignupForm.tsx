import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import { Card, CardBody } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export function SignupForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // after sign up → go to profile-setup
    navigate("/profile-setup");
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
            Create an account
          </h1>

          <p
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            Start your recipe journey
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

          <form onSubmit={handleSignup} style={{ display: "grid", gap: "1rem" }}>
            {/* FULL NAME */}
            <div>
              <label style={{ fontSize: "0.9rem" }}>Full name</label>              
            </div>
            <Input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ marginTop: "0.3rem", marginLeft: "0.3rem" }}
              />

            {/* EMAIL */}
            <div>
              <label style={{ fontSize: "0.9rem" }}>Email</label>
              
            </div>
            <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginTop: "0.3rem", marginLeft: "0.3rem" }}
              />

            {/* PASSWORD */}
            <div>
              <label style={{ fontSize: "0.9rem" }}>Password</label>
              
            </div>
            <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ marginTop: "0.3rem", marginLeft: "0.3rem" }}
              />

            {/* SMALLER SIGN UP BUTTON */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.45rem 1.2rem",
                  fontSize: "0.9rem",
                  borderRadius: "8px",
                }}
              >
                {loading ? "Creating..." : "Sign Up"}
              </Button>
            </div>
          </form>

          {/* ALREADY HAVE ACCOUNT */}
          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              opacity: 0.85,
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#4ea1ff" }}>
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
