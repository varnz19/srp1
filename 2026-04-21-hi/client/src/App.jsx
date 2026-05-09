import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DetailsPage from './pages/DetailsPage.jsx';
import MoodPage from './pages/MoodPage.jsx';
import Onboarding from './pages/Onboarding.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RandomPage from './pages/RandomPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TrendingPage from './pages/TrendingPage.jsx';
import Watchlist from './pages/Watchlist.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-ink text-white">Loading your taste graph...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  const hasPrefs = user.preferences?.genres?.length || user.preferences?.moods?.length;
  if (!hasPrefs && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="content/:id" element={<DetailsPage />} />
        <Route path="mood" element={<MoodPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="surprise" element={<RandomPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="watchlist" element={<Watchlist />} />
      </Route>
    </Routes>
  );
}
