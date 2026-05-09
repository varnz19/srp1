import { motion } from 'framer-motion';
import { BookmarkPlus, Eye, Heart, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { asPoster } from '../lib/api.js';

export default function ContentCard({ item, onSave, onDismiss, compact = false }) {
  const [isLoved, setIsLoved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const detailsUrl = item._id ? `/content/${item._id}` : null;
  const PosterWrapper = detailsUrl ? Link : 'div';
  
  const directors = item.directors || [];
  const cast = item.cast || [];
  const stringPeople = item.people && !directors.length && !cast.length ? item.people : [];

  const handleLove = (e) => {
    e.preventDefault();
    const nextState = !isLoved;
    setIsLoved(nextState);
    if (nextState) setIsSaved(false);
    onSave?.(item, nextState ? 'favorite' : 'none');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nextState = !isSaved;
    setIsSaved(nextState);
    if (nextState) setIsLoved(false);
    onSave?.(item, nextState ? 'saved' : 'none');
  };
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-2xl backdrop-blur-md"
    >
      <PosterWrapper {...(detailsUrl ? { to: detailsUrl } : {})} className="relative block w-full">
        <div className={compact ? 'aspect-[16/10] overflow-hidden' : 'aspect-[2/3] overflow-hidden'}>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          <img src={asPoster(item)} alt={item.title} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:rotate-1" />
          
          <div className="absolute bottom-0 left-0 right-0 z-20 flex w-full translate-y-4 flex-col justify-end p-5 opacity-90 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="line-clamp-2 text-xl font-black tracking-tight text-white drop-shadow-md">{item.title}</h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
              <span className="rounded-full bg-ember/90 px-2 py-0.5 uppercase tracking-wider text-white shadow-sm">{item.type}</span>
              <span>{item.releaseYear || 'New'}</span>
              <span className="flex items-center gap-1 text-yellow-400">★ {item.rating?.toFixed?.(1) || item.rating || 'NR'}</span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {item.reason || item.overview || 'No description available.'}
            </p>
            
            {(directors.length > 0 || cast.length > 0 || stringPeople.length > 0) && (
              <div className="mt-4 flex flex-col gap-2 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cast & Crew</div>
                <div className="flex flex-wrap gap-2">
                  {directors.map(d => typeof d === 'object' && d !== null ? (
                    <div key={d.name} className="flex items-center gap-1.5 rounded-full bg-black/40 pr-2 backdrop-blur-md">
                      {d.profileUrl ? <img src={d.profileUrl} alt={d.name} className="h-6 w-6 rounded-full object-cover border border-white/10" /> : <div className="h-6 w-6 rounded-full bg-white/20" />}
                      <span className="text-[10px] font-medium text-white/90">{d.name} <span className="text-white/40">(Dir)</span></span>
                    </div>
                  ) : null)}
                  {cast.slice(0, 3).map(c => typeof c === 'object' && c !== null ? (
                    <div key={c.name} className="flex items-center gap-1.5 rounded-full bg-black/40 pr-2 backdrop-blur-md">
                      {c.profileUrl ? <img src={c.profileUrl} alt={c.name} className="h-6 w-6 rounded-full object-cover border border-white/10" /> : <div className="h-6 w-6 rounded-full bg-white/20" />}
                      <span className="text-[10px] font-medium text-white/90">{c.name}</span>
                    </div>
                  ) : null)}
                  {stringPeople.slice(0, 3).map(p => (
                    <div key={p} className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">{p}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PosterWrapper>
      
      <div className="relative z-20 flex flex-col justify-between space-y-4 bg-gradient-to-b from-black/90 to-black/95 p-5">
        <div className="flex flex-wrap gap-1.5">
          {(item.genres || []).slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 backdrop-blur-md">{genre}</span>
          ))}
        </div>
        
        {(onSave || onDismiss) && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 pt-2">
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.85 }}
              animate={isSaved ? { scale: [1, 1.1, 1], backgroundColor: '#0ea5e9', color: '#ffffff' } : {}}
              transition={{ duration: 0.3 }}
              className={`group/btn focus-ring relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isSaved ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.6)]' : 'bg-ice/10 text-ice hover:bg-ice hover:text-black hover:shadow-[0_0_15px_rgba(153,246,228,0.5)]'}`}
              aria-label="Save"
            >
              <BookmarkPlus size={16} className={`transition-transform ${isSaved ? 'fill-current' : 'group-hover/btn:scale-110'}`} /> 
              <span className="tracking-wide">{isSaved ? 'Saved' : 'Save'}</span>
            </motion.button>
            <motion.button
              onClick={handleLove}
              whileTap={{ scale: 0.85 }}
              animate={isLoved ? { scale: [1, 1.1, 1], backgroundColor: '#e11d48', color: '#ffffff' } : {}}
              transition={{ duration: 0.3 }}
              className={`group/btn focus-ring relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isLoved ? 'bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.8)]' : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}
              aria-label="Favorite"
            >
              <motion.div animate={isLoved ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                <Heart size={16} className={`transition-transform ${isLoved ? 'fill-current' : 'group-hover/btn:scale-110'}`} />
              </motion.div>
              <span className="tracking-wide">{isLoved ? 'Loved!' : 'Love'}</span>
            </motion.button>
            <button
              onClick={() => onDismiss?.(item)}
              className="focus-ring grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white/50 transition-all hover:bg-white/20 hover:text-white"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-1">
          {detailsUrl && (
            <Link to={detailsUrl} className="group/link inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 transition-colors hover:text-white">
              <Eye size={16} className="transition-transform group-hover/link:scale-110" /> View Details
            </Link>
          )}
          {item.scoreBreakdown && (
            <div className="flex items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-xs font-bold text-mint">
              <Sparkles size={13} className="animate-pulse" /> Match {(Number(item.score || 0) * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
