import { AnimatePresence } from 'framer-motion';
import { Bot, Flame, HeartPulse, Mic, RefreshCw, Search, Shuffle, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { api } from '../lib/api.js';
import { dismissContent, saveContent } from '../lib/contentActions.js';

const moods = ['happy', 'dark', 'thrilling', 'emotional', 'chill'];

export default function Dashboard() {
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [netflix, setNetflix] = useState([]);
  const [prime, setPrime] = useState([]);
  const [filters, setFilters] = useState({ mood: '', type: 'all', q: '' });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const [trendRes, recRes, newRes, nflx, amzn] = await Promise.all([
      api.get('/content/trending', { params: { type: filters.type } }),
      api.get('/recommendations', { params: filters }),
      api.get('/content/new-releases'),
      api.get('/content/by-platform', { params: { provider: 8 } }),
      api.get('/content/by-platform', { params: { provider: 119 } })
    ]);
    const shuffledRec = [...(recRes.data.data || [])].sort(() => Math.random() - 0.5);
    const shuffledNew = [...(newRes.data.newReleases || [])].sort(() => Math.random() - 0.5);
    setTrending(trendRes.data.trending || []);
    setRecommendations(shuffledRec);
    setNewReleases(shuffledNew);
    setNetflix(nflx.data.data || []);
    setPrime(amzn.data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filters.mood, filters.type]);

  async function save(item, status) {
    await saveContent(item, status);
  }

  async function dismiss(item) {
    await dismissContent(item);
    setTrending((items) => items.filter((x) => x._id !== item._id));
    setRecommendations((items) => items.filter((x) => x._id !== item._id));
  }



  async function search(event) {
    event.preventDefault();
    setLoading(true);
    if (filters.q.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(filters.q)}`;
      return;
    }
    setLoading(false);
  }

  function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFilters((current) => ({ ...current, q: transcript }));
    };
    recognition.start();
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5">
        <div className="min-h-[360px] rounded-lg bg-[linear-gradient(90deg,rgba(8,10,18,0.9),rgba(8,10,18,0.35)),url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-ember">For you</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight md:text-6xl">Find the next thing that actually fits tonight.</h1>
          <form onSubmit={search} className="mt-8 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-white/45" size={18} />
              <input className="focus-ring w-full rounded-lg border border-white/10 bg-black/45 py-3 pl-10 pr-4" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search or ask for a vibe..." />
            </div>
            <Button type="button" variant="secondary" onClick={startVoiceSearch} aria-label="Voice search">
              <Mic size={18} />
            </Button>
            <Button type="submit">Search</Button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/trending" className="inline-flex items-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500">
              <Flame size={17} /> Trending
            </Link>
            <Link to="/mood" className="inline-flex items-center gap-2 rounded-lg bg-mint/16 px-4 py-2.5 text-sm font-bold text-mint transition hover:bg-mint/24">
              <HeartPulse size={17} /> Browse by mood
            </Link>
            <Link to="/search" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
              <Search size={17} /> Search
            </Link>
            <Link to="/surprise" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
              <Shuffle size={17} /> Surprise me
            </Link>
          </div>
        </div>

      </section>



      <section className="glass rounded-lg p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-bold"><SlidersHorizontal size={18} /> Discovery controls</div>
          <div className="flex flex-wrap gap-2">
            <select className="focus-ring rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              {['all', 'movie', 'tv', 'anime'].map((type) => <option key={type}>{type}</option>)}
            </select>
            {moods.map((mood) => (
              <button key={mood} onClick={() => setFilters({ ...filters, mood: filters.mood === mood ? '' : mood })} className={`rounded-lg px-3 py-2 text-sm ${filters.mood === mood ? 'bg-mint text-ink' : 'bg-white/8 text-white/70'}`}>{mood}</button>
            ))}
            <Button type="button" variant="ghost" onClick={load} disabled={loading} aria-label="Refresh recommendations">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Trending Now</h2>
          {loading && <span className="text-sm text-white/55">Refreshing...</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {trending.slice(0, 4).map((item) => (
              <ContentCard key={`trend-${item._id}`} item={item} onSave={save} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-rose-300">Recently Released</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {newReleases.slice(0, 4).map((item) => (
              <ContentCard key={`new-${item._id}`} item={item} onSave={save} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-[#E50914]">Popular on Netflix</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {netflix.slice(0, 4).map((item) => (
              <ContentCard key={`nflx-${item._id}`} item={item} onSave={save} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-[#00A8E1]">Popular on Prime Video</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {prime.slice(0, 4).map((item) => (
              <ContentCard key={`amzn-${item._id}`} item={item} onSave={save} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Personalized recommendations</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {recommendations.slice(0, 8).map((item) => (
              <ContentCard key={`rec-${item._id}`} item={item} onSave={save} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
