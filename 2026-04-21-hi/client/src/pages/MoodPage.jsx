import { CloudMoon, Drama, Laugh, Moon, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../lib/api.js';
import { dismissContent, saveContent } from '../lib/contentActions.js';

const moods = [
  { id: 'happy', label: 'Happy', icon: Laugh, copy: 'Bright, funny, energetic picks.' },
  { id: 'dark', label: 'Dark', icon: Moon, copy: 'Noir, horror, crime, and uneasy stories.' },
  { id: 'thrilling', label: 'Thrilling', icon: Zap, copy: 'Fast-paced, tense, and twist-heavy.' },
  { id: 'emotional', label: 'Emotional', icon: Drama, copy: 'Heartfelt drama and moving stories.' },
  { id: 'chill', label: 'Chill', icon: CloudMoon, copy: 'Low-stakes comfort and relaxed music.' }
];

export default function MoodPage() {
  const [mood, setMood] = useState('thrilling');
  const [type, setType] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(nextMood = mood, nextType = type) {
    setLoading(true);
    await api.get('/content/discover', { params: { mood: nextMood, type: nextType, page: Math.ceil(Math.random() * 5) } });
    const { data } = await api.get('/recommendations', { params: { mood: nextMood, type: nextType, limit: 32 } });
    setItems(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load(mood, type);
  }, [mood, type]);

  async function dismiss(item) {
    await dismissContent(item);
    setItems((current) => current.filter((entry) => entry._id !== item._id));
  }

  return (
    <div>
      <PageHeader eyebrow="Mood browser" title="What are you in the mood for?">
        Pick a vibe first, then browse recommendations shaped by your profile and behavior.
      </PageHeader>
      <section className="mb-7 grid gap-3 md:grid-cols-5">
        {moods.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              key={entry.id}
              onClick={() => setMood(entry.id)}
              className={`focus-ring rounded-lg border p-4 text-left transition ${mood === entry.id ? 'border-mint bg-mint/15 text-white' : 'border-white/10 bg-white/6 text-white/70 hover:bg-white/10'}`}
            >
              <Icon size={22} />
              <div className="mt-3 font-black">{entry.label}</div>
              <p className="mt-1 text-xs text-white/55">{entry.copy}</p>
            </button>
          );
        })}
      </section>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <select className="focus-ring rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
          {['all', 'movie', 'tv', 'anime'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        <Button variant="secondary" onClick={() => load()} disabled={loading}>Give me more</Button>
        {loading && <span className="text-sm text-white/52">Finding matches...</span>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ContentCard key={item._id} item={item} onSave={saveContent} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  );
}
