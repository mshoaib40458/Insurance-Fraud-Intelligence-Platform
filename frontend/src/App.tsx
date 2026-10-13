// App Component with Routing + Auth Guard

import { Routes, Route, Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Claims } from '@/pages/Claims';
import { Search } from '@/pages/Search';
import { ClaimDetail } from '@/pages/ClaimDetail';
import { Analytics } from '@/pages/Analytics';
import { Investigations } from '@/pages/Investigations';
import { Login } from '@/pages/Login';
import { useAuth } from '@/context/AuthContext';

function ClaimDetailRoute() {
  const { claimIndex } = useParams<{ claimIndex: string }>();
  return <ClaimDetail claimIndex={claimIndex ?? ''} />;
}

// Protects all routes — redirects to /login if not authenticated
function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/"                      element={<Dashboard />} />
        <Route path="/claims"                element={<Claims />} />
        <Route path="/claims/:claimIndex"    element={<ClaimDetailRoute />} />
        <Route path="/search"                element={<Search />} />
        <Route path="/analytics"             element={<Analytics />} />
        <Route path="/investigations"        element={<Investigations />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Redirect to dashboard if already logged in
function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default App;