import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { doc, updateDoc, collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { Camera, User, Mail, Shield, CheckCircle2, ChevronRight, KeyRound, Clock, Activity, AlertTriangle } from 'lucide-react';
import { toSafeDate } from '../lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FirebaseError } from 'firebase/app';
import { useConfirmStore } from '../store/confirmStore';
import { logActivity, ActivityType } from '../services/activityService';

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: any;
}

export default function Profile() {
  const { user, userData } = useAuthStore();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [loading, setLoading] = useState(false);
  const { openConfirm } = useConfirmStore();

  const [passwordCooldown, setPasswordCooldown] = useState(0);
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [indexError, setIndexError] = useState(false);
  const [notifPerms, setNotifPerms] = useState({ system: true, security: true, files: true });
  const [activeTab, setActiveTab] = useState<'profile' | 'social'>('profile');
  const [socialLinks, setSocialLinks] = useState({
    google: '', facebook: '', playGames: '', gameCenter: '', apple: '', github: '', microsoft: '', twitter: '', yahoo: ''
  });

  useEffect(() => {
    if (userData?.notificationPreferences) {
      setNotifPerms(userData.notificationPreferences);
    }
    if (userData?.socialLinks) {
       setSocialLinks({...socialLinks, ...userData.socialLinks});
    }
  }, [userData]);

  useEffect(() => {
    if (!user) return;

    // We simplify the query to avoid the index error (where + orderBy requires composite index)
    // We will sort client-side for the latest 10 activities
    const q = query(
      collection(db, 'activities'), 
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const allActivities = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ActivityLog));

      // Client-side sort and limit
      const sorted = allActivities
        .sort((a, b) => {
          const dateA = a.timestamp ? toSafeDate(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? toSafeDate(b.timestamp).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10);

      setActivities(sorted);
      setIndexError(false);
    }, (error) => {
      console.error("Firestore activities error:", error);
      if (error.code === 'failed-precondition') {
        setIndexError(true);
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    let pTimer: any, vTimer: any;
    if (passwordCooldown > 0) pTimer = setInterval(() => setPasswordCooldown(c => c - 1), 1000);
    if (verifyCooldown > 0) vTimer = setInterval(() => setVerifyCooldown(c => c - 1), 1000);
    return () => { clearInterval(pTimer); clearInterval(vTimer); };
  }, [passwordCooldown, verifyCooldown]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        notificationPreferences: notifPerms
      });
      await logActivity(ActivityType.UPDATE_PROFILE, `Đã cập nhật cấu hình tài khoản (Tên: ${displayName})`);
      toast.success('Cập nhật cấu hình thành công');
      
      // Request browser push notification permission if enabled
      if (notifPerms.system || notifPerms.security || notifPerms.files) {
        if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        socialLinks
      });
      await logActivity(ActivityType.UPDATE_PROFILE, 'Đã cập nhật liên kết mạng xã hội');
      toast.success('Lưu liên kết mạng xã hội thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu liên kết');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email || passwordCooldown > 0) return;
    openConfirm({
      title: 'Đổi mật khẩu',
      message: 'Bạn có chắc chắn muốn nhận email đổi mật khẩu chứ?',
      confirmText: 'Gửi Email',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        try {
          await sendPasswordResetEmail(auth, user.email!);
          await logActivity(ActivityType.SECURITY_CHANGE, 'Yêu cầu đổi mật khẩu qua email');
          toast.success('Đã gửi email đổi mật khẩu. Vui lòng kiểm tra hộp thư.');
          setPasswordCooldown(60);
        } catch (error) {
          if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
              toast.error('Tài khoản không tồn tại.');
          } else {
              toast.error('Lỗi gửi email đổi mật khẩu. Có thể bạn đang dùng Google Login.');
          }
        }
      }
    });
  };

  const handleVerifyEmail = async () => {
    if (!user || verifyCooldown > 0) return;
    if (user.emailVerified) {
       toast.success('Email đã được xác minh trước đó.');
       return;
    }
    openConfirm({
      title: 'Xác minh Email',
      message: 'Bạn có chắc chắn muốn nhận email chứa thông tin xác minh?',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          await sendEmailVerification(user);
          await logActivity(ActivityType.SECURITY_CHANGE, 'Yêu cầu xác minh email');
          toast.success('Đã gửi email xác minh. Vui lòng kiểm tra hộp thư.');
          setVerifyCooldown(60);
        } catch (error) {
          toast.error('Gửi email xác minh thất bại. Xin thử lại sau.');
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Profile Summary */}
      <div className="glass-card rounded-[2rem] p-6 md:p-8 flex items-center flex-col sm:flex-row gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-500 to-indigo-600 opacity-20 blur-3xl pointer-events-none" />
        
        <div className="relative group">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary-500">
                {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center sm:text-left z-10 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {userData?.displayName || 'Người dùng'}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {userData?.email}
            </span>
            <span className="hidden sm:inline">・</span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Vai trò: <strong className="uppercase">{userData?.role}</strong>
            </span>
          </div>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
             <a href="https://myaccount.google.com/" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Tài khoản Google</a>
             <a href="https://myaccount.google.com/personal-info" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Thông tin cá nhân</a>
             <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Bảo mật</a>
             <a href="https://myaccount.google.com/notifications?origin=3" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Hoạt động bảo mật</a>
             <a href="https://myaccount.google.com/device-activity" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Thiết bị của bạn</a>
             <a href="https://myaccount.google.com/video-verification" target="_blank" rel="noreferrer" className="text-xs px-3 py-1 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full border border-slate-200 dark:border-white/10 transition text-slate-700 dark:text-slate-300">Video selfie</a>
          </div>
        </div>

        {userData?.role === 'superadmin' && (
          <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20">
            TÀI KHOẢN MASTER
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Tài khoản</button>
            <button onClick={() => setActiveTab('social')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'social' ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Liên kết mạng xã hội</button>
          </div>

          {activeTab === 'profile' && (
            <div className="glass-card rounded-[2rem] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Thông tin cá nhân
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-400">Email (Không thể thay đổi)</label>
                  <input 
                    type="email" 
                    value={userData?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent rounded-xl text-slate-500 cursor-not-allowed opacity-70"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Tùy chọn nhận thông báo (Push Notifications)</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition">
                      <input type="checkbox" checked={notifPerms.system} onChange={(e) => setNotifPerms({...notifPerms, system: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Thông báo hệ thống</p>
                        <p className="text-xs text-slate-500">Tin tức quan trọng, cập nhật tính năng mới</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition">
                      <input type="checkbox" checked={notifPerms.security} onChange={(e) => setNotifPerms({...notifPerms, security: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Cảnh báo bảo mật</p>
                        <p className="text-xs text-slate-500">Hoạt động đăng nhập đáng ngờ, đổi mật khẩu</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition">
                      <input type="checkbox" checked={notifPerms.files} onChange={(e) => setNotifPerms({...notifPerms, files: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Hoạt động chia sẻ File</p>
                        <p className="text-xs text-slate-500">Khi có file được cập nhật hoặc xóa</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition shadow-lg shadow-primary-500/20"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="glass-card rounded-[2rem] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                Liên kết mạng xã hội
              </h2>
              <form onSubmit={handleUpdateSocialLinks} className="space-y-4">
                {[
                  { id: 'google', label: 'Google Profile URL / ID' },
                  { id: 'facebook', label: 'Facebook URL' },
                  { id: 'playGames', label: 'Play Games ID' },
                  { id: 'gameCenter', label: 'Game Center ID' },
                  { id: 'apple', label: 'Apple ID / Email' },
                  { id: 'github', label: 'GitHub URL' },
                  { id: 'microsoft', label: 'Microsoft / Xbox ID' },
                  { id: 'twitter', label: 'Twitter (X) URL / username' },
                  { id: 'yahoo', label: 'Yahoo Email' }
                ].map(provider => (
                  <div key={provider.id}>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">{provider.label}</label>
                    <input 
                      type="text" 
                      value={(socialLinks as any)[provider.id]}
                      onChange={e => setSocialLinks({...socialLinks, [provider.id]: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900 dark:text-white"
                      placeholder={`Nhập ${provider.label} đã liên kết`}
                    />
                  </div>
                ))}
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-lg shadow-blue-500/20"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi liên kết'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Security & Stats Box */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Bảo mật
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={handleChangePassword} 
                disabled={passwordCooldown > 0}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition text-left text-sm group disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  Đổi mật khẩu {passwordCooldown > 0 && `(${passwordCooldown}s)`}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
              </button>

              <button 
                onClick={handleVerifyEmail} 
                disabled={verifyCooldown > 0 || user?.emailVerified}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition text-left text-sm group disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  {user?.emailVerified ? 'Đã xác minh Email' : `Xác minh Email ${verifyCooldown > 0 ? `(${verifyCooldown}s)` : ''}`}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <h3 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-wider">Thống kê</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày tham gia</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {userData?.createdAt ? toSafeDate(userData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="h-px bg-slate-200 dark:bg-white/10" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái tài khoản</p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Đang hoạt động
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-[2rem] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Lịch sử hoạt động
            </h3>
            
            <div className="space-y-6">
              {indexError && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase leading-tight">
                    Hệ thống đang yêu cầu khởi tạo Index cho dữ liệu hoạt động. Vui lòng liên hệ Admin hoặc thử lại sau.
                  </p>
                </div>
              )}
              {activities.length > 0 ? (
                activities.map((log) => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-1">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{log.description}</p>
                    <p className="text-[10px] text-slate-500">
                      {log.timestamp ? format(toSafeDate(log.timestamp), 'HH:mm - dd/MM/yyyy', { locale: vi }) : 'Vừa xong'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Chưa có hoạt động nào được ghi lại.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
