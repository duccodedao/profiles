/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, ADMIN_EMAIL } from './lib/firebase';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProjects from './pages/AdminProjects';
import AdminProjectForm from './pages/AdminProjectForm';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import AdminTasks from './pages/AdminTasks';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminDeposits from './pages/AdminDeposits';
import AccountPage from './pages/AccountPage';
import ReferralPage from './pages/ReferralPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import TasksPage from './pages/TasksPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawPage from './pages/WithdrawPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ToolsPage from './pages/ToolsPage';
import DepositPage from './pages/DepositPage';
import AuthActionPage from './pages/AuthActionPage';
import Layout from './components/Layout';
import { Sparkles, ArrowLeft } from 'lucide-react';

const ComingSoonPage = ({ title }: { title: string }) => (
  <Layout>
    <div className="py-20 text-center max-w-lg mx-auto px-4">
      <div className="w-20 h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center mx-auto border border-violet-600/20 mb-8 relative">
        <Sparkles className="w-10 h-10 text-violet-400 absolute" />
        <span className="w-4 h-4 bg-violet-500 rounded-full animate-ping absolute top-2 right-2"></span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">{title}</h1>
      <p className="text-slate-400 text-lg mb-8">Tính năng này đang được chúng tôi phát triển và sẽ sớm ra mắt trong thời gian tới.</p>
      <button 
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all text-slate-400"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
    </div>
  </Layout>
);

// Protected Route Component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500 w-12 h-12" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function AuthRedirect() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  if (mode && oobCode && location.pathname === '/') {
    return <Navigate to={`/auth/action?${searchParams.toString()}`} replace />;
  }
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirect />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#A78BFA',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/auth/action" element={<AuthActionPage />} />
        <Route path="/store" element={<ComingSoonPage title="Cửa hàng" />} />
        <Route path="/deposit" element={<DepositPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/projects" 
          element={
            <ProtectedAdminRoute>
              <AdminProjects />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/projects/new" 
          element={
            <ProtectedAdminRoute>
              <AdminProjectForm />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/projects/edit/:id" 
          element={
            <ProtectedAdminRoute>
              <AdminProjectForm />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedAdminRoute>
              <AdminSettings />
            </ProtectedAdminRoute>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/tasks" 
          element={
            <ProtectedAdminRoute>
              <AdminTasks />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/submissions" 
          element={
            <ProtectedAdminRoute>
              <AdminSubmissions />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/withdrawals" 
          element={
            <ProtectedAdminRoute>
              <AdminWithdrawals />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/deposits" 
          element={
            <ProtectedAdminRoute>
              <AdminDeposits />
            </ProtectedAdminRoute>
          } 
        />

        {/* User Protected Routes */}
        <Route path="/account" element={<AccountPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
