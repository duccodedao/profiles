import React, { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL } from '../lib/firebase';
import { LogIn, LogOut, LayoutDashboard, Home, Rocket, Menu, X, Ban, Hammer, ShieldAlert, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Sidebar from './Sidebar';
import { AppUser } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = React.useState<AppUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isBanned, setIsBanned] = React.useState(false);
  const [checkLoading, setCheckLoading] = React.useState(true);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const location = useLocation();

  React.useEffect(() => {
    const checkBanAndFetchProfile = async () => {
      if (!user) {
        setCheckLoading(false);
        setProfile(null);
        return;
      }

      try {
        // 1. Fetch Profile & Check Ban
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as AppUser;
          setProfile(data);
          if (data.isBanned) {
            setIsBanned(true);
            setCheckLoading(false);
            return;
          }
        }

        // 2. Check IP/Device blacklist
        const deviceId = localStorage.getItem('app_device_id');
        let currentIp = '';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          currentIp = data.ip;
        } catch (e) {}

        if (deviceId) {
          const deviceSnap = await getDoc(doc(db, 'blacklist', `device_${deviceId}`));
          if (deviceSnap.exists()) {
            setIsBanned(true);
            setCheckLoading(false);
            return;
          }
        }

        if (currentIp) {
          const ipSnap = await getDoc(doc(db, 'blacklist', `ip_${currentIp.replace(/\./g, '_')}`));
          if (ipSnap.exists()) {
            setIsBanned(true);
            setCheckLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Ban check failed', err);
      } finally {
        setCheckLoading(false);
      }
    };

    checkBanAndFetchProfile();
  }, [user]);

  // Strict Verification Check
  const isUnverified = user && profile && !profile.isVerified && !isAdmin;
  const isExemptPage = location.pathname === '/account' || location.pathname === '/auth/action';

  if (isBanned) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-dark border-red-500/20 p-10 rounded-[40px] text-center space-y-6"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/20">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">TRUY CẬP BỊ CHẶN</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tài khoản, địa chỉ IP hoặc thiết bị của bạn đã bị cấm khỏi hệ thống do vi phạm chính sách của chúng tôi.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => auth.signOut()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Đăng xuất
            </button>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Liên hệ hỗ trợ nếu bạn cho rằng đây là một sự nhầm lẫn.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Unverified Blocking Overlay */}
      {isUnverified && !isExemptPage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-lg w-full glass-dark border-amber-500/30 p-10 rounded-[40px] text-center space-y-8 shadow-2xl shadow-amber-500/10"
          >
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white">YÊU CẦU XÁC MINH</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Để đảm bảo tính công bằng và bảo mật cho hệ thống Affiliate, bạn cần xác minh tài khoản trước khi có thể truy cập các tính năng khác.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <Link
                to="/account"
                className="gradient-bg w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-violet-500/20"
              >
                Xác minh ngay
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Bmass</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {!loading && (
            <>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400 font-bold text-xs border border-violet-500/20 hover:bg-violet-500/20 transition-all uppercase tracking-widest"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              
              {user ? (
                <div className="flex items-center gap-3 border-white/10">
                  <div className="hidden sm:flex flex-col text-right">
                    <p className="text-xs font-bold text-white leading-none">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{isAdmin ? 'Quản trị viên' : 'Thành viên'}</p>
                  </div>
                  
                  {!isAdmin && profile && (
                    <Link to="/transactions" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:scale-105 transition-all">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-[10px] font-black text-white">$</span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        {profile.balance?.toLocaleString('vi-VN')}đ
                      </span>
                    </Link>
                  )}

                  <img src={user.photoURL || ''} alt="avatar" className="w-9 h-9 rounded-full border border-violet-500/50" />
                  <button 
                    onClick={() => auth.signOut()}
                    className="text-slate-400 hover:text-red-400 p-1.5 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="gradient-bg px-5 py-2 rounded-xl font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
              )}
            </>
          )}
        </nav>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:sticky lg:top-[65px] lg:w-72 transition-all duration-300 transform lg:transform-none h-[calc(100vh-65px)] bg-slate-900 border-r border-white/5",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
           <div className="h-full overflow-y-auto px-6 py-6 scrollbar-hide">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
           </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">
          <div className={cn("mx-auto", !location.pathname.startsWith('/admin') && "max-w-screen-xl")}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 border-top border-white/5 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Bmass Hub. All rights reserved.</p>
        <p className="mt-1">Powered by sonlyhongduc@gmail.com</p>
      </footer>

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
      </div>
    </div>
  );
}
