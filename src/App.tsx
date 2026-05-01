import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore, UserData } from './store/authStore';
import { useAppStore } from './store/appStore';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoadingScreen from './components/ui/LoadingScreen';
import ConfirmModal from './components/ui/ConfirmModal';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthActionPage from './pages/AuthActionPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComingSoon from './pages/ComingSoon';
import NotificationsPage from './pages/NotificationsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import MaintenancePage from './pages/MaintenancePage';
import UtilitiesPage from './pages/UtilitiesPage';
import ProductsPage from './pages/ProductsPage';
import FilesPage from './pages/FilesPage';
import NewsPage from './pages/NewsPage';
import MarketPage from './pages/MarketPage';
import AirdropPage from './pages/AirdropPage';
import BanksPage from './pages/BanksPage';
import ExchangesPage from './pages/ExchangesPage';

const TabGuard = ({ children, tabKey }: { children: React.ReactNode, tabKey: 'products' | 'utilities' | 'files' | 'news' | 'market' | 'banks' | 'exchanges' }) => {
  const { maintenanceTabs } = useAppStore();
  const { isAdmin } = useAuthStore();
  
  if (maintenanceTabs[tabKey] && !isAdmin) {
    return <MaintenancePage />;
  }
  
  return <>{children}</>;
};

export default function App() {
  const { setUser, setUserData, setLoading, loading, isAdmin } = useAuthStore();
  const { maintenanceMode, setMaintenanceMode, setOnlineStatus, setMaintenanceTabs } = useAppStore();

  useEffect(() => {
    // Offline status listening
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial system settings check (could be cached)
    const checkSystemSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'system'));
        if (settingsDoc.exists()) {
          setMaintenanceMode(settingsDoc.data().maintenanceMode || false);
          if (settingsDoc.data().maintenanceTabs) {
            setMaintenanceTabs(settingsDoc.data().maintenanceTabs);
          }
        }
      } catch (err) {
        console.error("Could not fetch system settings", err);
      }
    };
    checkSystemSettings();

    // Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user data from firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {}
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setUser, setUserData, setLoading, setMaintenanceMode, setOnlineStatus, setMaintenanceTabs]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Maintenance mode guard
  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
      <ConfirmModal />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
        </Route>

        <Route path="/auth/action" element={<AuthActionPage />} />

        {/* Main App Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="utilities" element={<TabGuard tabKey="utilities"><UtilitiesPage /></TabGuard>} />
          <Route path="products" element={<TabGuard tabKey="products"><ProductsPage /></TabGuard>} />
          <Route path="files" element={<TabGuard tabKey="files"><FilesPage /></TabGuard>} />
          <Route path="news" element={<TabGuard tabKey="news"><NewsPage /></TabGuard>} />
          <Route path="market" element={<TabGuard tabKey="market"><MarketPage /></TabGuard>} />
          <Route path="banks" element={<TabGuard tabKey="banks"><BanksPage /></TabGuard>} />
          <Route path="exchanges" element={<TabGuard tabKey="exchanges"><ExchangesPage /></TabGuard>} />
          <Route path="about" element={<AboutPage />} />
          <Route path="airdrop" element={<AirdropPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="contact" element={<ContactPage />} />
          
          {/* Admin Routes */}
          <Route path="admin/*" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
