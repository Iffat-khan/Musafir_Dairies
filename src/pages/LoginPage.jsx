import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="min-h-full grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold">Welcome back</div>
          <div className="text-white/60 text-sm">
            Login to access your trips, budgets, and travel tools.
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setBusy(true);
                try {
                  await login(email, password);
                  navigate("/dashboard");
                } catch (err) {
                  setError("Login failed. Check your email/password.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <div className="text-xs text-white/60 mb-1">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Password</div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              {error ? <div className="text-sm text-rose-300">{error}</div> : null}

              <Button className="w-full" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </Button>
              <div className="text-sm text-white/60">
                No account?{" "}
                <Link className="text-indigo-300 hover:text-indigo-200" to="/signup">
                  Create one
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

