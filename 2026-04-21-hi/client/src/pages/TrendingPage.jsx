import { Flame, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../lib/api.js';
import { dismissContent, saveContent } from '../lib/contentActions.js';

export default function TrendingPage() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    if (type === 'tv') {
      const { data } = await api.get('/tv/trending');
      setItems([...(data.data || [])].sort(() => Math.random() - 0.5));
      setLoading(false);
      return;
    }
    if (type === 'movie') {
      const { data } = await api.get('/movies/trending');
      setItems([...(data.data || [])].sort(() => Math.random() - 0.5));
      setLoading(false);
      return;
    }
    if (type === 'all') {
      const [movies, tv] = await Promise.all([api.get('/movies/trending'), api.get('/tv/trending')]);
      const combined = [...(movies.data.data || []), ...(tv.data.data || [])].slice(0, 24);
      setItems(combined.sort(() => Math.random() - 0.5));
      setLoading(false);
      return;
    }
    const { data } = await api.get('/content/trending', { params: { type } });
    setItems([...(data.trending || [])].sort(() => Math.random() - 0.5));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [type]);

  async function save(item, status) {
    await saveContent(item, status);
  }

  async function dismiss(item) {
    await dismissContent(item);
    setItems((current) => current.filter((entry) => entry._id !== item._id));
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <PageHeader eyebrow="Live pulse" title="Trending now">
          Explore real-time cinematic trends and high-engagement releases, curated through cross-platform behavioral intelligence.
        </PageHeader>
        <Button variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </Button>
      </div>
      <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-ember/15 px-3 py-2 text-sm text-orange-100">
        <Flame size={16} /> {loading ? 'Pulling trending titles...' : `${items.length} titles ready`}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'tv', 'movie', 'anime'].map((entry) => (
          <button
            key={entry}
            onClick={() => setType(entry)}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-bold capitalize ${type === entry ? 'bg-ember text-white' : 'bg-white/8 text-white/68 hover:bg-white/12'}`}
          >
            {entry}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          {items.map((item) => (
            <ContentCard key={item._id || Math.random()} item={item} onSave={save} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
