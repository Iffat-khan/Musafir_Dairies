import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="min-h-full grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold">Create your account</div>
          <div className="text-white/60 text-sm">
            Save trips, track budgets, and connect with travelers.
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setBusy(true);
                try {
                  await signup(displayName, email, password);
                  navigate("/dashboard");
                } catch (err) {
                  setError("Signup failed. Try a different email.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <div className="text-xs text-white/60 mb-1">Display name</div>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Password</div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
              </div>

              {error ? <div className="text-sm text-rose-300">{error}</div> : null}

              <Button className="w-full" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </Button>
              <div className="text-sm text-white/60">
                Already have an account?{" "}
                <Link className="text-indigo-300 hover:text-indigo-200" to="/login">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

