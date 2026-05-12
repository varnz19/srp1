import { Mic, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../lib/api.js';
import { dismissContent, saveContent } from '../lib/contentActions.js';

export default function SearchPage() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [type, setType] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event?.preventDefault();
    setLoading(true);
    if (!q.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await api.get('/recommendations', { params: { query: q, type } });
    setItems(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (q) submit();
  }, []);

  function voice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => setQ(event.results[0][0].transcript);
    recognition.start();
  }

  async function dismiss(item) {
    await dismissContent(item);
    setItems((current) => current.filter((entry) => entry._id !== item._id));
  }

  return (
    <div>
      <PageHeader eyebrow="Search" title="Find exactly what you want">
        Discover content with intent-aware search, leveraging deep metadata to find the perfect match for your specific vibe.
      </PageHeader>
      <form onSubmit={submit} className="glass mb-7 grid gap-3 rounded-lg p-4 md:grid-cols-[1fr_160px_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-white/45" size={18} />
          <input className="focus-ring w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Movie, show, anime, artist..." />
        </div>
        <select className="focus-ring rounded-lg border border-white/10 bg-panel px-3 py-3 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
          {['all', 'movie', 'tv', 'anime'].map((entry) => <option key={entry}>{entry}</option>)}
        </select>
        <Button type="button" variant="secondary" onClick={voice} aria-label="Voice search"><Mic size={18} /></Button>
        <Button type="submit" disabled={loading}>Search</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ContentCard key={item._id} item={item} onSave={saveContent} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  );
}
