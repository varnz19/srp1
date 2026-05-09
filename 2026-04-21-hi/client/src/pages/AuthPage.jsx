import { motion } from 'framer-motion';
import { Clapperboard, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'demo@example.com', password: 'password123' });
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await signup(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_20%,rgba(80,216,144,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,107,53,0.18),transparent_32%),#080a12] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-panel md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative min-h-[520px] p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,107,53,0.28),transparent_45%),url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-80" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3 text-2xl font-black">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ember"><Clapperboard /></span>
              &lt;CineSense/&gt;
            </div>
            <div>
              <h1 className="max-w-md text-4xl font-black leading-tight md:text-5xl">Entertainment discovery tuned to your mood.</h1>
              <p className="mt-4 max-w-md text-white/76">Movies, shows, and anime ranked by your taste graph, behavior, and what you feel like tonight.</p>
            </div>
          </div>
        </section>
        <form onSubmit={submit} className="space-y-5 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ember">{mode === 'login' ? 'Welcome back' : 'Create profile'}</p>
            <h2 className="mt-2 text-3xl font-black">{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
          </div>
          {mode === 'signup' && (
            <label className="block text-sm text-white/70">
              Name
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus-ring" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
          )}
          <label className="block text-sm text-white/70">
            Email
            <input type="email" className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus-ring" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="block text-sm text-white/70">
            Password
            <input type="password" className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus-ring" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
          <Button className="w-full" type="submit">
            <LogIn size={18} /> {mode === 'login' ? 'Login' : 'Create account'}
          </Button>
          <button type="button" className="text-sm text-white/62 hover:text-white" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
