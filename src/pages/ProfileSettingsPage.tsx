import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, verifyBeforeUpdateEmail } from 'firebase/auth';
import { AppUser } from '../types';
import Layout from '../components/Layout';
import { Settings, User, Bell, Shield, Save, Loader2, Camera, CreditCard, Phone, Globe, Mail, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const BANK_LIST = [
  { name: 'Vietcombank', code: 'VCB' },
  { name: 'MB Bank', code: 'MB' },
  { name: 'Techcombank', code: 'TCB' },
  { name: 'Agribank', code: 'VBA' },
  { name: 'VPBank', code: 'VPB' },
  { name: 'ACB', code: 'ACB' },
  { name: 'BIDV', code: 'BIDV' },
  { name: 'VietinBank', code: 'ICB' },
  { name: 'TPBank', code: 'TPB' },
  { name: 'Sacombank', code: 'STB' },
];

export default function ProfileSettingsPage() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  const [displayName, setDisplayName] = React.useState('');
  const [bankCode, setBankCode] = React.useState('');
  const [bankAccountNumber, setBankAccountNumber] = React.useState('');
  const [bankAccountName, setBankAccountName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+84');

  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as AppUser;
          setProfile(data);
          setDisplayName(data.displayName || '');
          setBankCode(data.bankCode || '');
          setBankAccountNumber(data.bankAccountNumber || '');
          setBankAccountName(data.bankAccountName || '');
          setPhoneNumber(data.phoneNumber || '');
          if (data.countryCode) {
            setCountryCode(data.countryCode);
          } else {
            // Auto detect from IP if no country code set
            try {
              const res = await fetch('https://ipapi.co/json/');
              const ipData = await res.json();
              if (ipData.country_calling_code) {
                setCountryCode(ipData.country_calling_code);
              }
            } catch (e) {}
          }
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bankCode,
        bankName: BANK_LIST.find(b => b.code === bankCode)?.name || '',
        bankAccountNumber,
        bankAccountName,
        phoneNumber,
        countryCode,
        updatedAt: new Date()
      });
      toast.success('Đã cập nhật cài đặt thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const [newEmail, setNewEmail] = React.useState('');
  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi gửi email');
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || (!newEmail && !user.email)) return;
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      toast.success('Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư mới của bạn.');
      setNewEmail('');
    } catch (err: any) {
      if (err.message.includes('requires-recent-login')) {
        toast.error('Bạn cần đăng nhập lại để thực hiện thao tác này.');
      } else {
        toast.error(err.message || 'Lỗi khi cập nhật email');
      }
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
            <Settings className="text-slate-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Cài đặt</h1>
            <p className="text-slate-500">Tùy chỉnh thông báo và hồ sơ cá nhân</p>
          </div>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Profile Settings */}
          <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <User className="w-5 h-5 text-violet-400" />
              <h2 className="font-bold text-white uppercase tracking-widest text-xs">Thông tin cá nhân</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Họ và tên hiển thị</label>
                 <input 
                   type="text"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600 font-medium"
                   placeholder="Nhập tên của bạn"
                 />
               </div>

               <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Số điện thoại</label>
                 <div className="flex gap-2">
                   <input 
                     type="text"
                     value={countryCode}
                     onChange={(e) => setCountryCode(e.target.value)}
                     className="w-24 glass bg-white/5 border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white font-black text-center"
                     placeholder="+84"
                   />
                   <input 
                     type="tel"
                     value={phoneNumber}
                     onChange={(e) => setPhoneNumber(e.target.value)}
                     className="flex-1 glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600 font-medium"
                     placeholder="Số điện thoại"
                   />
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ảnh đại diện</label>
                 <div className="flex items-center gap-4">
                   <img src={user.photoURL || ''} alt="" className="w-14 h-14 rounded-full border border-white/10" />
                   <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all">
                     <Camera className="w-4 h-4" />
                     Thay đổi (Soon)
                   </button>
                 </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="gradient-bg px-8 py-3.5 rounded-2xl text-white font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu cài đặt
              </button>
            </div>
          </div>

          {/* Bank Settings */}
          <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white uppercase tracking-widest text-xs">Thiết lập ngân hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên ngân hàng</label>
                 <select 
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white font-medium appearance-none"
                 >
                   <option value="" className="bg-slate-900">Chọn ngân hàng</option>
                   {BANK_LIST.map(bank => (
                      <option key={bank.code} value={bank.code} className="bg-slate-900">{bank.name} ({bank.code})</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Số tài khoản</label>
                 <input 
                   type="text"
                   value={bankAccountNumber}
                   onChange={(e) => setBankAccountNumber(e.target.value)}
                   className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600 font-medium"
                   placeholder="Nhập số tài khoản"
                 />
               </div>

               <div className="space-y-4 md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên chủ tài khoản (Viết hoa không dấu)</label>
                 <input 
                   type="text"
                   value={bankAccountName}
                   onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                   className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600 font-medium font-mono uppercase"
                   placeholder="NGUYEN VAN A"
                 />
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu thông tin ngân hàng
              </button>
            </div>
          </div>

          {/* Account Management & Security */}
          <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-white uppercase tracking-widest text-xs">Phân quyền & Định danh</h2>
            </div>

            <div className="space-y-6">
              {/* Reset Password */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Đổi mật khẩu</h3>
                    <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ gửi email chứa liên kết đặt lại mật khẩu của bạn.</p>
                  </div>
                </div>
                <button
                  onClick={handleResetPassword}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 whitespace-nowrap"
                >
                  Gửi yêu cầu
                </button>
              </div>

               {/* Change Email */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="w-full md:w-64">
                    <h3 className="text-sm font-bold text-white">Thay đổi Email</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <input 
                         type="email"
                         value={newEmail}
                         onChange={(e) => setNewEmail(e.target.value)}
                         placeholder={user.email || "Email mới"}
                         className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                       />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button
                    onClick={handleUpdateEmail}
                    className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 whitespace-nowrap"
                  >
                    Xác nhận đổi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy/Security */}
          <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-white uppercase tracking-widest text-xs">Bảo mật & Quyền riêng tư</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Xác minh 2 lớp (2FA)</p>
                  <p className="text-xs text-slate-500">Bảo vệ tài khoản của bạn mạnh mẽ hơn</p>
                </div>
                <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
                </div>
              </div>

               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Thông báo qua Email</p>
                  <p className="text-xs text-slate-500">Nhận cập nhật về các dự án mới</p>
                </div>
                <div className="w-12 h-6 bg-violet-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
