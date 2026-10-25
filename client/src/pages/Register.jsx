import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password, inviteCode);
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
          Join the family reel.
        </p>

        <form onSubmit={submit} className="mt-8 rounded-3xl border border-ink-700/70 bg-ink-900 p-6 shadow-2xl">
          <h2 className="font-display text-xl font-semibold text-white">Create your account</h2>
          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <label className="label mt-5">Your name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <label className="label mt-4">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@family.com" />
          <label className="label mt-4">Password</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label className="label mt-4">Family invite code</label>
          <input className="input" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Ask the family for the code" />
          <button className="btn-ember mt-6 w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already in?{" "}
            <Link to="/login" className="font-medium text-ember-400 hover:text-ember-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
