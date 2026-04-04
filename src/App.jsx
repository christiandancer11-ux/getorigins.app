import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard.jsx';
import RegisterCard from './pages/RegisterCard';
import CardDetail from './pages/CardDetail';
import ScanCard from './pages/ScanCard';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import CardShow from './pages/CardShow';
import MarketValue from './pages/MarketValue';
import Trending from './pages/Trending';
import AdminCodes from './pages/AdminCodes';
import PriceAlerts from './pages/PriceAlerts';
import TradeDashboard from './pages/TradeDashboard';
import CollectorProfile from './pages/CollectorProfile';
import BOLOAlerts from './pages/BOLOAlerts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Support from './pages/Support';
import Marketing from './pages/Marketing';
import GradedCertScan from './pages/GradedCertScan';
import ProCardFlipper from './pages/ProCardFlipper';
import SocialFeed from './pages/SocialFeed';
import UserSearch from './pages/UserSearch';
import Pricing from './pages/Pricing';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterCard />} />
        <Route path="/cards/:id" element={<CardDetail />} />
        <Route path="/scan/:code" element={<ScanCard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/card-show" element={<CardShow />} />
        <Route path="/market" element={<MarketValue />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/admin/codes" element={<AdminCodes />} />
        <Route path="/alerts" element={<PriceAlerts />} />
        <Route path="/trade-dashboard" element={<TradeDashboard />} />
        <Route path="/collector/:email" element={<CollectorProfile />} />
        <Route path="/bolo" element={<BOLOAlerts />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/support" element={<Support />} />
        <Route path="/features" element={<Marketing />} />
        <Route path="/graded/:company/:cert" element={<GradedCertScan />} />
        <Route path="/flipper" element={<ProCardFlipper />} />
        <Route path="/feed" element={<SocialFeed />} />
        <Route path="/users" element={<UserSearch />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App