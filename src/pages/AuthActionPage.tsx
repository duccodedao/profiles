import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  applyActionCode, 
  checkActionCode 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Layout from '../components/Layout';
import { 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff,
  Home,
  MailCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'reset-password' | 'confirm-verify'>('loading');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!oobCode || !mode) {
      setStatus('error');
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case 'verifyEmail':
            const info = await checkActionCode(auth, oobCode);
            setEmail(info.data.email || '');
            setStatus('confirm-verify');
            break;
          case 'resetPassword':
            const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
            setEmail(verifiedEmail);
            setStatus('reset-password');
            break;
          default:
            setStatus('error');
        }
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        toast.error(err.message || 'Thao tác không hợp lệ hoặc đã hết hạn');
      }
    };

    handleAction();
  }, [mode, oobCode]);

  const handleVerifyEmail = async () => {
    if (!oobCode) return;
    setIsProcessing(true);
    try {
      await applyActionCode(auth, oobCode);
      setStatus('success');
      toast.success('Xác minh email thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xác minh email');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải từ 6 ký tự');
      return;
    }
    setIsProcessing(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus('success');
      toast.success('Đổi mật khẩu thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-white/10 p-10 rounded-[40px] text-center space-y-8 shadow-2xl"
        >
          {status === 'loading' && (
            <div className="space-y-6 py-10">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang xác thực hệ thống...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic">THÀNH CÔNG!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {mode === 'verifyEmail' 
                    ? 'Email của bạn đã được xác minh. Bây giờ bạn có thể trải nghiệm đầy đủ các tính năng.'
                    : 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại bằng mật khẩu mới.'}
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 gradient-bg rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-violet-500/20"
              >
                <Home className="w-4 h-4" /> QUAY LẠI TRANG CHỦ
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic text-red-500">THẤT BẠI</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Liên kết này không hợp lệ, đã được sử dụng hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-white transition-all"
              >
                VỀ TRANG CHỦ
              </Link>
            </div>
          )}

          {status === 'confirm-verify' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center mx-auto border border-violet-600/20 shadow-xl shadow-violet-500/5">
                   <MailCheck className="w-10 h-10 text-violet-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Xác minh Email</h2>
                  <p className="text-slate-400 text-sm">Bạn đang thực hiện xác minh cho địa chỉ email:</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-violet-400 font-bold text-xs mt-2">
                    {email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleVerifyEmail}
                disabled={isProcessing}
                className="w-full gradient-bg py-5 rounded-[30px] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                XÁC NHẬN XÁC MINH
              </button>

              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Nếu đây không phải là yêu cầu của bạn, vui lòng bỏ qua.
              </p>
            </div>
          )}

          {status === 'reset-password' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center mx-auto border border-violet-600/20">
                   <Lock className="w-10 h-10 text-violet-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic">Đặt lại mật khẩu</h2>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white/5 p-2 rounded-xl">
                   <MailCheck className="w-3.5 h-3.5" /> {email}
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6 text-left">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mật khẩu mới</label>
                   <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                </div>

                <button
                  disabled={isProcessing}
                  className="w-full gradient-bg py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  CẬP NHẬT MẬT KHẨU
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
