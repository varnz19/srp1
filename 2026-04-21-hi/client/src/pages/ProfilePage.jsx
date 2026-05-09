import { ExternalLink, KeyRound, Link as LinkIcon, Save, UserRound } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const genres = ['Sci-Fi', 'Drama', 'Comedy', 'Action', 'Thriller', 'Romance', 'Animation', 'Dark Fantasy', 'Crime', 'Mystery', 'Pop', 'R&B', 'Indie'];

const platforms = [
  { name: 'Netflix', url: 'https://www.netflix.com' },
  { name: 'Prime Video', url: 'https://www.primevideo.com' },
  { name: 'Hulu', url: 'https://www.hulu.com' },
  { name: 'Disney+', url: 'https://www.disneyplus.com' },
  { name: 'Apple TV', url: 'https://tv.apple.com' },
  { name: 'Max', url: 'https://www.max.com' },
  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com' }
];

export default function ProfilePage() {
  const { user, updatePreferences, updateProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [account, setAccount] = useState({ name: user.name, email: user.email, currentPassword: '', newPassword: '' });
  const [prefs, setPrefs] = useState({
    genres: user.preferences?.genres || [],
    moods: user.preferences?.moods || [],
    platforms: user.preferences?.platforms || [],
    contentTypes: user.preferences?.contentTypes || ['movie', 'tv', 'anime'],
    people: user.preferences?.people || []
  });

  function toggleGenre(value) {
    setPrefs((current) => ({
      ...current,
      genres: current.genres.includes(value) ? current.genres.filter((item) => item !== value) : [...current.genres, value]
    }));
  }

  function togglePlatform(value) {
    setPrefs((current) => ({
      ...current,
      platforms: current.platforms.includes(value) ? current.platforms.filter((item) => item !== value) : [...current.platforms, value]
    }));
  }

  async function saveAccount(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile(account);
      setAccount((current) => ({ ...current, currentPassword: '', newPassword: '' }));
      setMessage('Login details updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update login details.');
    }
  }

  async function saveTaste(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    await updatePreferences(prefs);
    setMessage('Preferences updated.');
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title="Account and connections">
        Keep login details current, tune genres compactly, and connect the platforms you actually use.
      </PageHeader>

      <section className="glass rounded-lg p-5">
        <div className="mb-5 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-ember shadow-glow">
            <UserRound size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black">{user.name}</h2>
            <p className="text-sm text-white/55">{user.email}</p>
          </div>
        </div>
        <form onSubmit={saveAccount} className="grid gap-3 md:grid-cols-2">
          <input className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3" value={account.name} onChange={(event) => setAccount({ ...account, name: event.target.value })} placeholder="Name" />
          <input type="email" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} placeholder="Email" />
          <input type="password" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3" value={account.currentPassword} onChange={(event) => setAccount({ ...account, currentPassword: event.target.value })} placeholder="Current password" />
          <input type="password" className="focus-ring rounded-lg border border-white/10 bg-white/5 px-4 py-3" value={account.newPassword} onChange={(event) => setAccount({ ...account, newPassword: event.target.value })} placeholder="New password" />
          <div className="md:col-span-2">
            <Button type="submit"><KeyRound size={18} /> Save login details</Button>
          </div>
        </form>
      </section>

      <form onSubmit={saveTaste} className="space-y-6">
        <section className="glass rounded-lg p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Genres</h2>
            <span className="text-xs text-white/45">{prefs.genres.length} selected</span>
          </div>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
            {genres.map((genre) => (
              <button
                type="button"
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`focus-ring rounded-md border px-2.5 py-1.5 text-xs font-semibold ${prefs.genres.includes(genre) ? 'border-ember bg-ember text-white' : 'border-white/10 bg-white/6 text-white/68'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-lg p-5">
          <h2 className="mb-3 text-lg font-bold">Streaming platforms</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => {
              const connected = prefs.platforms.includes(platform.name);
              return (
                <div key={platform.name} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="font-bold">{platform.name}</div>
                    <a href={platform.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-ice hover:text-white">
                      Open <ExternalLink size={12} />
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlatform(platform.name)}
                    className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${connected ? 'bg-mint text-ink' : 'bg-white/10 text-white/65 hover:bg-white/15'}`}
                  >
                    <LinkIcon size={13} /> {connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit"><Save size={18} /> Save preferences</Button>
          {message && <span className="text-sm text-mint">{message}</span>}
          {error && <span className="text-sm text-red-300">{error}</span>}
        </div>
      </form>
    </div>
  );
}
