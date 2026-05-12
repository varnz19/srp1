import { Dice5, RefreshCw, Shuffle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../lib/api.js';
import { dismissContent, saveContent } from '../lib/contentActions.js';

export default function RandomPage() {
  const [type, setType] = useState('all');
  const [mood, setMood] = useState('');
  const [pick, setPick] = useState(null);
  const [copy, setCopy] = useState('');
  const [loading, setLoading] = useState(false);
  const moods = ['happy', 'dark', 'thrilling', 'emotional', 'chill'];

  async function loadRandom(next = {}) {
    setLoading(true);
    const params = { type: next.type ?? type, mood: next.mood ?? mood };
    const { data } = await api.get('/recommendations/random', { params });
    setPick(data.pick);
    setCopy(data.answer);
    setLoading(false);
  }

  useEffect(() => {
    loadRandom();
  }, []);

  async function dismiss(item) {
    await dismissContent(item);
    await loadRandom();
  }

  return (
    <div>
      <PageHeader eyebrow="Surprise" title="Pick something for me">
        A curated single-point discovery path. Refresh until our engine aligns with your immediate preference.
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select className="focus-ring rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm" value={type} onChange={(event) => { setType(event.target.value); loadRandom({ type: event.target.value }); }}>
          {['all', 'movie', 'tv', 'anime'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        {moods.map((entry) => (
          <button key={entry} onClick={() => { const next = mood === entry ? '' : entry; setMood(next); loadRandom({ mood: next }); }} className={`rounded-lg px-3 py-2 text-sm ${mood === entry ? 'bg-mint text-ink' : 'bg-white/8 text-white/68 hover:bg-white/12'}`}>
            {entry}
          </button>
        ))}
        <Button variant="secondary" onClick={() => loadRandom()} disabled={loading}>
          <RefreshCw size={16} /> Reroll
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div>
          {pick && <ContentCard item={pick} onSave={saveContent} onDismiss={dismiss} />}
        </div>
        <section className="glass rounded-lg p-6">
          <div className="flex items-center gap-2 text-lg font-black"><Shuffle size={20} /> Tonight's random pick</div>
          <p className="mt-4 text-lg leading-8 text-white/72">{copy || 'Loading a random recommendation...'}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/8 px-3 py-2 text-sm text-white/62">
            <Dice5 size={16} /> Synthesizing historical preference vectors and behavioral signals for a precision-randomized match.
          </div>
        </section>
      </div>
    </div>
  );
}
