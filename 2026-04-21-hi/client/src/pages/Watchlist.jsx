import { CheckCircle, Heart, PlayCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ContentCard from '../components/ContentCard.jsx';
import { api } from '../lib/api.js';

const tabs = ['all', 'saved', 'watching', 'completed', 'favorite'];

export default function Watchlist() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/content/watchlist').then(({ data }) => setEntries(data.entries));
  }, []);

  const filtered = useMemo(() => entries.filter((entry) => tab === 'all' || entry.status === tab), [entries, tab]);

  async function update(entry, status) {
    const { data } = await api.post('/content/watchlist', { contentId: entry.content._id, status });
    setEntries((items) => items.map((item) => (item._id === entry._id ? data.entry : item)));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-mint">Library</p>
        <h1 className="mt-2 text-4xl font-black">Watchlist and favorites</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2 text-sm capitalize ${tab === item ? 'bg-ember text-white' : 'bg-white/8 text-white/70'}`}>{item}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="glass rounded-lg p-8 text-white/65">Your library is waiting for a few good saves.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((entry) => (
            <div key={entry._id} className="space-y-2">
              <ContentCard item={entry.content} />
              <div className="grid grid-cols-3 gap-2">
                <button className="rounded-lg bg-white/8 p-2 text-white/70 hover:bg-white/12" onClick={() => update(entry, 'watching')} aria-label="Watching"><PlayCircle className="mx-auto" size={18} /></button>
                <button className="rounded-lg bg-white/8 p-2 text-white/70 hover:bg-white/12" onClick={() => update(entry, 'completed')} aria-label="Completed"><CheckCircle className="mx-auto" size={18} /></button>
                <button className="rounded-lg bg-white/8 p-2 text-white/70 hover:bg-white/12" onClick={() => update(entry, 'favorite')} aria-label="Favorite"><Heart className="mx-auto" size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
