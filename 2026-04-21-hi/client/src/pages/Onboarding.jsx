import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const choices = {
  genres: ['Sci-Fi', 'Drama', 'Comedy', 'Action', 'Thriller', 'Romance', 'Animation', 'Dark Fantasy', 'Pop', 'R&B'],
  moods: ['happy', 'dark', 'thrilling', 'emotional', 'chill'],
  platforms: ['Netflix', 'Prime Video', 'Hulu', 'Disney+', 'Apple TV', 'Max', 'Crunchyroll', 'Spotify'],
  contentTypes: ['movie', 'tv', 'anime']
};

export default function Onboarding() {
  const { user, updatePreferences } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    genres: user.preferences?.genres || [],
    moods: user.preferences?.moods || [],
    platforms: user.preferences?.platforms || [],
    contentTypes: user.preferences?.contentTypes || [],
    people: user.preferences?.people || []
  });
  const [person, setPerson] = useState('');

  function toggle(group, value) {
    const next = form[group].includes(value) ? form[group].filter((item) => item !== value) : [...form[group], value];
    setForm({ ...form, [group]: next });
  }

  async function submit() {
    await updatePreferences(form);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,107,53,0.18),transparent_35%),#080a12] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-mint">Taste setup</p>
          <h1 className="mt-2 text-4xl font-black">Build your recommendation DNA</h1>
        </div>
        <div className="space-y-6">
          {Object.entries(choices).map(([group, values]) => (
            <section key={group} className="glass rounded-lg p-5">
              <h2 className="mb-4 text-lg font-bold capitalize">{group.replace(/([A-Z])/g, ' $1')}</h2>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    key={value}
                    onClick={() => toggle(group, value)}
                    className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${form[group].includes(value) ? 'border-ember bg-ember text-white' : 'border-white/10 bg-white/6 text-white/72'}`}
                  >
                    {form[group].includes(value) && <Check size={15} />} {value}
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
          <section className="glass rounded-lg p-5">
            <h2 className="mb-4 text-lg font-bold">Favorite actors, directors, artists</h2>
            <div className="flex gap-2">
              <input className="focus-ring min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Christopher Nolan, Frank Ocean..." />
              <Button type="button" onClick={() => { if (person.trim()) setForm({ ...form, people: [...form.people, person.trim()] }); setPerson(''); }}>Add</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.people.map((name) => (
                <button key={name} onClick={() => setForm({ ...form, people: form.people.filter((p) => p !== name) })} className="rounded bg-white/10 px-3 py-1 text-sm text-white/72">{name}</button>
              ))}
            </div>
          </section>
          <Button onClick={submit} className="w-full sm:w-auto">
            Start discovering <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
