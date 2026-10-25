import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(params.get("next") || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fadeUp">
        <h1 className="text-center font-display text-5xl font-semibold text-white">
          Rewind<span className="text-ember-500">.</span>
        </h1>
        <p className="mt-2 text-center font-display text-lg italic text-slate-400">
          Our memories, streaming.
        </p>

        <form onSubmit={submit} className="mt-8 rounded-3xl border border-ink-700/70 bg-ink-900 p-6 shadow-2xl">
          <h2 className="font-display text-xl font-semibold text-white">Welcome back</h2>
          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <label className="label mt-5">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@family.com"
          />
          <label className="label mt-4">Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button className="btn-ember mt-6 w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-400">
            New to the family reel?{" "}
            <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next"))}` : ""}`} className="font-medium text-ember-400 hover:text-ember-300">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
