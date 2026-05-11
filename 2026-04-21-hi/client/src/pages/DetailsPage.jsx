import { ArrowLeft, Bookmark, CheckCircle, Heart, Mic2, UsersRound, Video, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { api, asPoster } from '../lib/api.js';

export default function DetailsPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    api.get(`/content/${id}`).then(({ data }) => {
      setContent(data.content);
      setSimilar(data.similar);
    });
    const started = Date.now();
    return () => {
      const seconds = Math.round((Date.now() - started) / 1000);
      if (seconds > 4) api.post('/recommendations/track', { contentId: id, action: 'time_spent', value: seconds }).catch(() => {});
    };
  }, [id]);

  async function status(next) {
    await api.post('/content/watchlist', { contentId: id, status: next });
  }

  if (!content) return <div className="py-20 text-center text-white/60">Loading details...</div>;
  const directors = content.directors?.length ? content.directors : (content.people || []).slice(0, 1);
  const cast = content.cast?.length ? content.cast : (content.people || []).slice(1);
  

  const getDirectLink = () => {
    if (!content.platforms?.length) return content.watchUrl;
    const p = content.platforms[0];
    const title = encodeURIComponent(content.title);
    if (p.toLowerCase().includes('netflix')) return `https://www.netflix.com/search?q=${title}`;
    if (p.toLowerCase().includes('prime')) return `https://www.primevideo.com/search?phrase=${title}`;
    if (p.toLowerCase().includes('hotstar') || p.toLowerCase().includes('disney')) return `https://www.hotstar.com/in/search?q=${title}`;
    if (p.toLowerCase().includes('jio')) return `https://www.jiocinema.com/search/${title}`;
    if (p.toLowerCase().includes('zee5')) return `https://www.zee5.com/search?q=${title}`;
    if (p.toLowerCase().includes('sony')) return `https://www.sonyliv.com/search/${title}`;
    if (p.toLowerCase().includes('apple')) return `https://tv.apple.com/search?term=${title}`;
    return content.watchUrl;
  };

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft size={16} /> Back to discovery</Link>
      <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <img src={asPoster(content)} alt={content.title} className="w-full rounded-lg border border-white/10 object-cover shadow-glow" />
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-ember px-2 py-1 text-xs font-bold uppercase">{content.type}</span>
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{content.releaseYear}</span>
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{content.rating} ★</span>
          </div>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">{content.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">{content.overview}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/42">Runtime</div>
              <div className="mt-1 font-bold">{content.durationMinutes ? `${content.durationMinutes} min` : 'Not listed'}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/42">Source</div>
              <div className="mt-1 font-bold capitalize">{content.source || 'catalog'}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/42">Language</div>
              <div className="mt-1 font-bold">{content.language || 'Not listed'}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/42">Popularity</div>
              <div className="mt-1 font-bold">{Math.round(content.popularity || 0)}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:col-span-2 xl:col-span-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/42">Where to watch</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.platforms?.length ? content.platforms.map((p) => {
                  const title = encodeURIComponent(content.title);
                  let url = '';
                  if (p.toLowerCase().includes('netflix')) url = `https://www.netflix.com/search?q=${title}`;
                  else if (p.toLowerCase().includes('prime')) url = `https://www.primevideo.com/search?phrase=${title}`;
                  else if (p.toLowerCase().includes('hotstar') || p.toLowerCase().includes('disney')) url = `https://www.hotstar.com/in/search?q=${title}`;
                  else if (p.toLowerCase().includes('jio')) url = `https://www.jiocinema.com/search/${title}`;
                  else if (p.toLowerCase().includes('zee5')) url = `https://www.zee5.com/search?q=${title}`;
                  else if (p.toLowerCase().includes('sony')) url = `https://www.sonyliv.com/search/${title}`;
                  else if (p.toLowerCase().includes('apple')) url = `https://tv.apple.com/search?term=${title}`;
                  
                  if (url) {
                    return (
                      <a key={p} href={url} target="_blank" rel="noopener noreferrer" className="rounded bg-sky-500/20 px-2.5 py-1 text-sm font-bold text-sky-300 hover:bg-sky-500/40 transition">
                        {p}
                      </a>
                    );
                  }
                  return (
                    <span key={p} className="rounded bg-white/10 px-2.5 py-1 text-sm font-bold text-white/60">{p}</span>
                  );
                }) : <span className="text-sm font-bold text-white/50">Not available on streaming</span>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {content.genres?.map((genre) => <span key={genre} className="rounded-lg bg-white/8 px-3 py-2 text-sm text-white/70">{genre}</span>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {(content.watchUrl || content.platforms?.length > 0) && (
              <Button onClick={() => window.open(getDirectLink(), '_blank')} className="bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20">
                <ExternalLink size={18} /> Watch Now
              </Button>
            )}
            <Button onClick={() => status('saved')}><Bookmark size={18} /> Save</Button>
            <Button variant="secondary" onClick={() => status('favorite')}><Heart size={18} /> Favorite</Button>
            <Button variant="secondary" onClick={() => status('completed')}><CheckCircle size={18} /> Completed</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <>
          <div className="glass rounded-lg p-5">
            <div className="mb-3 flex items-center gap-2 font-bold"><Video size={18} /> Directors / creators</div>
            <div className="flex flex-wrap gap-2">
              {(directors.length ? directors : ['Not listed']).map((person) => {
                const name = typeof person === 'object' && person !== null ? person.name : person;
                const img = typeof person === 'object' && person !== null ? person.profileUrl : null;
                return (
                  <Link to={`/search?q=${encodeURIComponent(name)}`} key={name} className="flex items-center gap-2 rounded-full bg-white/8 pr-3 transition hover:bg-white/16">
                    {img ? <img src={img} alt={name} className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-white/10" />}
                    <span className="text-sm text-white/90">{name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="glass rounded-lg p-5 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2 font-bold"><UsersRound size={18} /> Cast / key people</div>
            <div className="flex flex-wrap gap-2">
              {(cast.length ? cast : content.people || ['Not listed']).slice(0, 12).map((person) => {
                const name = typeof person === 'object' && person !== null ? person.name : person;
                const img = typeof person === 'object' && person !== null ? person.profileUrl : null;
                return (
                  <Link to={`/search?q=${encodeURIComponent(name)}`} key={name} className="flex items-center gap-2 rounded-full bg-white/8 pr-3 transition hover:bg-white/16">
                    {img ? <img src={img} alt={name} className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-white/10" />}
                    <span className="text-sm text-white/90">{name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      </section>



      {content.trailerUrl && (
        <section>
          <h2 className="mb-4 text-2xl font-black">Trailer</h2>
          <div className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
            <iframe className="h-full w-full" src={content.trailerUrl} title={`${content.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-black">Because you liked {content.title}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => <ContentCard key={item._id} item={item} compact />)}
        </div>
      </section>
    </div>
  );
}
