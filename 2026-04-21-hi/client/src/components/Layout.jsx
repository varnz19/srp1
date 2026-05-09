import { Dice5, Flame, Library, LogOut, Search, SmilePlus, Sparkles, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.16),transparent_34%),linear-gradient(180deg,#080a12,#0d1020_45%,#080a12)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember shadow-glow">
              <Sparkles size={20} />
            </span>
            <span className="text-xl font-black tracking-wide">&lt;CineSense/&gt;</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navClass}>
              <Sparkles size={17} /> For You
            </NavLink>
            <NavLink to="/trending" className={navClass}>
              <Flame size={17} /> Trending
            </NavLink>
            <NavLink to="/mood" className={navClass}>
              <SmilePlus size={17} /> Mood
            </NavLink>
            <NavLink to="/search" className={navClass}>
              <Search size={17} /> Search
            </NavLink>
            <NavLink to="/surprise" className={navClass}>
              <Dice5 size={17} /> Surprise
            </NavLink>
            <NavLink to="/watchlist" className={navClass}>
              <Library size={17} /> Library
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              <UserRound size={17} /> Profile
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="hidden text-sm text-white/60 hover:text-white sm:block">{user?.name}</Link>
            <Button variant="ghost" onClick={logout} aria-label="Logout">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
