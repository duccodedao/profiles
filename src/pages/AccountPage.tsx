import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification, reload } from 'firebase/auth';
import { AppUser } from '../types';
import Layout from '../components/Layout';
import { User, Mail, Shield, Calendar, Tag, CreditCard, ChevronRight, CheckCircle2, AlertCircle, RefreshCcw, Loader2, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = React.useState<AppUser | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [verificationSent, setVerificationSent] = React.useState(false);

  const fetchProfile = React.useCallback(async () => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data() as AppUser;
        setProfile(data);
      }
    }
  }, [user]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSendVerification = async () => {
    if (!user) return;
    setVerifying(true);
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      toast.success('Đã gửi email xác minh! Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi: ' + (err.message || 'Không thể gửi mail'));
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await reload(user);
      await fetchProfile();
      
      // We only allow verifying if they manually clicked send verification, 
      // OR if the provider inherently isn't password based, but we still force them to do the step.
      if (auth.currentUser?.emailVerified && verificationSent) {
        await updateDoc(doc(db, 'users', user.uid), { isVerified: true });
        setProfile(prev => prev ? { ...prev, isVerified: true } : null);
        toast.success('Tài khoản đã được xác minh thành công!');
      } else if (auth.currentUser?.emailVerified && !verificationSent) {
         toast.error('Vui lòng nhất nút "Gửi mail xác minh" trước.');
      } else {
        toast.error('Tài khoản chưa được xác minh. Vui lòng kiểm tra email của bạn.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Đã xảy ra lỗi khi kiểm tra hệ thống.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  const formatDate = (date: any) => {
    if (!date?.toDate) return '---';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date.toDate());
  };

  const sections = [
    { label: 'Trạng thái', value: profile?.isVerified ? <span className="flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-widest text-[10px]">Đã xác minh <CheckCircle2 className="w-4 h-4" /></span> : <span className="flex items-center gap-1.5 text-amber-500 font-black uppercase tracking-widest text-[10px]">Chờ xác minh <Clock className="w-4 h-4" /></span>, icon: Shield },
    { label: 'Vai trò', value: profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên', icon: Shield },
    { label: 'Họ tên', value: profile?.displayName, icon: User },
    { label: 'Email', value: profile?.email, icon: Mail },
    { label: 'Số điện thoại', value: `${profile?.countryCode || ''} ${profile?.phoneNumber || ''}`, icon: Phone },
    { label: 'Mã giới thiệu', value: profile?.referralCode, icon: Tag },
    { label: 'Ngày tham gia', value: formatDate(profile?.createdAt), icon: Calendar },
  ];

  const bankSections = [
    { label: 'Ngân hàng', value: profile?.bankName || 'Chưa thiết lập', icon: CreditCard },
    { label: 'Số tài khoản', value: profile?.bankAccountNumber || 'Chưa thiết lập', icon: Tag },
    { label: 'Chủ tài khoản', value: profile?.bankAccountName || 'Chưa thiết lập', icon: User },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center shadow-xl">
              <User className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Tài khoản của tôi</h1>
              <p className="text-slate-500">Thông tin cá nhân & Xác minh tài khoản</p>
            </div>
          </div>
        </div>

        {/* Verification Alert */}
        {!profile?.isVerified && (
          <div className="glass-dark border border-amber-500/20 bg-amber-500/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <AlertCircle className="text-amber-500 w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Xác minh ngay</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Vui lòng xác minh email để mở khóa đầy đủ tính năng rút tiền.</p>
              </div>
            </div>
            <div className="flex gap-2 relative z-10 w-full md:w-auto">
               <button
                 onClick={handleSendVerification}
                 disabled={verifying}
                 className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
               >
                 {verifying ? '...' : 'Gửi mã'}
               </button>
               <button
                 onClick={handleCheckStatus}
                 disabled={checking}
                 className="flex-1 md:flex-none px-5 py-2.5 rounded-xl glass bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
               >
                 {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                 Kiểm tra
               </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="glass-dark border border-white/5 rounded-3xl p-8 text-center space-y-4">
              <div className="relative inline-block">
                <img 
                  src={user.photoURL || ''} 
                  alt={user.displayName || ''} 
                  className="w-32 h-32 rounded-full border-4 border-violet-500/20 shadow-2xl mx-auto"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  {user.displayName}
                </h2>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="pt-4 flex justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                 <div className="px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                   {profile?.role}
                 </div>
                 {profile?.isVerified && (
                    <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Verified
                    </div>
                 )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Detailed Info */}
            <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden">
               <div className="px-8 py-5 border-b border-white/5 bg-white/5">
                 <h3 className="font-bold text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                   <Shield className="w-4 h-4 text-violet-400" />
                   Thông tin tài khoản
                 </h3>
               </div>
               <div className="divide-y divide-white/5">
                 {sections.map((section, idx) => (
                   <div key={idx} className="px-8 py-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-9 h-9 rounded-xl bg-slate-500/5 flex items-center justify-center text-slate-500 group-hover:text-violet-400 transition-all">
                         <section.icon className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">{section.label}</p>
                         <p className="text-slate-200 text-sm font-medium">{section.value || '---'}</p>
                       </div>
                     </div>
                     <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-violet-400 transition-all" />
                   </div>
                 ))}
               </div>
            </div>

            {/* Bank Info */}
            <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden">
               <div className="px-8 py-5 border-b border-white/5 bg-white/5">
                 <h3 className="font-bold text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                   <CreditCard className="w-4 h-4 text-emerald-400" />
                   Thông tin thanh toán (Bank)
                 </h3>
               </div>
               <div className="divide-y divide-white/5">
                 {bankSections.map((section, idx) => (
                   <div key={idx} className="px-8 py-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-9 h-9 rounded-xl bg-slate-500/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-all">
                         <section.icon className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">{section.label}</p>
                         <p className="text-slate-200 text-sm font-medium">{section.value || '---'}</p>
                       </div>
                     </div>
                     <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-emerald-400 transition-all" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
