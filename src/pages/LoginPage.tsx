import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, ADMIN_EMAIL, createOrUpdateUser } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { Rocket, ShieldCheck, Mail, ArrowRight, UserPlus } from 'lucide-react';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'login' | 'referral'>('login');
  const [refCode, setRefCode] = useState(searchParams.get('ref') || '');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      const checkUser = async () => {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          setStep('referral');
        }
      };
      checkUser();
    }
  }, [user, loading, navigate, location]);

  if (loading) return null;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login error:', err);
      try {
        await signInWithRedirect(auth, provider);
      } catch (e) {
        console.error('Redirect login error:', e);
      }
    }
  };

  const handleFinishProfile = async () => {
    if (!user) return;
    setIsFinishing(true);

    if (refCode) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', refCode.trim().toUpperCase()));
      const querySnap = await getDocs(q);
      if (querySnap.empty) {
        toast.error('Mã giới thiệu không tồn tại!');
        setIsFinishing(false);
        return;
      }
    }

    try {
      await createOrUpdateUser(user, refCode);
      toast.success('Đăng nhập thành công!');
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Error finishing profile:', err);
      toast.error('Lỗi: ' + err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 text-center px-4">
        <div className="glass rounded-3xl p-10 space-y-8 border-white/10 relative overflow-hidden">
          {step === 'login' ? (
            <>
              <div className="space-y-4">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                  <ShieldCheck className="text-white w-10 h-10" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Đăng nhập tài khoản</h1>
                <p className="text-slate-400 text-sm">Vui lòng đăng nhập để tiếp tục</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-lg active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
                  Tiếp tục với Google
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f172a] px-2 text-slate-500">Hoặc</span></div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  Lưu ý: Chỉ quản trị viên mới có quyền truy cập bảng điều khiển đầy đủ.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-violet-500/10 rounded-2xl flex items-center justify-center shadow-xl mx-auto border border-violet-500/20">
                  <UserPlus className="text-violet-400 w-10 h-10" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">Cấu hình hồ sơ</h1>
                <p className="text-slate-400 text-sm">Chào mừng thành viên mới! Nếu bạn có mã giới thiệu, hãy nhập bên dưới.</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mã giới thiệu (Không bắt buộc)</label>
                  <input 
                    type="text"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                    placeholder="VD: ABCD12"
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600 font-mono tracking-widest"
                  />
                </div>

                <button
                  onClick={handleFinishProfile}
                  disabled={isFinishing}
                  className="w-full flex items-center justify-center gap-2 gradient-bg text-white font-bold py-3.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/20"
                >
                  {isFinishing ? 'Đang lưu...' : 'Hoàn tất đăng ký'}
                  {!isFinishing && <ArrowRight className="w-4 h-4" />}
                </button>
                
                <p className="text-[10px] text-slate-500 text-center italic">Bạn có thể bỏ qua và cập nhật sau trong phần cài đặt.</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16" />
        </div>
      </div>
    </Layout>
  );
}
