import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { AppUser } from '../types';
import Layout from '../components/Layout';
import { doc, getDoc, collection, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Wallet, Info, ArrowUpRight, ShieldCheck, Loader2, AlertTriangle, Building2, CreditCard, User, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const MIN_WITHDRAW = 50000;
const MAX_WITHDRAW_DAILY = 1000000;

export default function WithdrawPage() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [amount, setAmount] = useState<number>(MIN_WITHDRAW);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data() as AppUser);
        setFetching(false);
      });
    }
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    if (!profile.isVerified) {
      toast.error('Tài khoản chưa được xác minh');
      return;
    }

    if (amount < MIN_WITHDRAW) {
      toast.error(`Số tiền rút tối thiểu là ${(MIN_WITHDRAW || 0).toLocaleString()}đ`);
      return;
    }

    if (amount > (profile.balance || 0)) {
      toast.error('Số dư không đủ');
      return;
    }

    if (!profile.bankAccountNumber || !profile.bankCode || !profile.bankAccountName) {
      toast.error('Vui lòng cập nhật thông tin ngân hàng trong cài đặt');
      navigate('/settings');
      return;
    }

    setLoading(true);
    try {
      // Check daily limit
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      // Avoid complex query that needs composite index
      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', user.uid)
      );
      
      const dailySnap = await getDocs(q);
      const dailyTotal = dailySnap.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (data.status !== 'rejected' && data.createdAt) {
          const docDate = data.createdAt.toDate();
          if (docDate >= startOfDay) {
            return acc + data.amount;
          }
        }
        return acc;
      }, 0);

      if (dailyTotal + amount > MAX_WITHDRAW_DAILY) {
        toast.error(`Hạn mức rút tối đa mỗi ngày là ${MAX_WITHDRAW_DAILY.toLocaleString()}đ. Bạn đã rút ${dailyTotal.toLocaleString()}đ hôm nay.`);
        setLoading(false);
        return;
      }

      const batch = writeBatch(db);
      
      const newWithdrawalRef = doc(collection(db, 'withdrawals'));
      batch.set(newWithdrawalRef, {
        userId: user.uid,
        userName: profile.displayName,
        userEmail: profile.email,
        amount,
        bankCode: profile.bankCode,
        bankAccountNumber: profile.bankAccountNumber,
        bankAccountName: profile.bankAccountName,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Deduct balance immediately
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        balance: profile.balance - amount // Or use increment(-amount) if preferred, but we already read it
      });

      await batch.commit();

      toast.success('Yêu cầu rút tiền đã được gửi! Số dư đã được trừ tạm thời.');
      setAmount(MIN_WITHDRAW);
      // Refresh balance
      const newSnap = await getDoc(doc(db, 'users', user.uid));
      if (newSnap.exists()) setProfile(newSnap.data() as AppUser);
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi gửi yêu cầu rút tiền: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" /></div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 space-y-12">
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-[20px] flex items-center justify-center mx-auto border border-emerald-500/20 mb-6">
            <Wallet className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Rút tiền về tài khoản</h1>
          <p className="text-slate-400 font-medium">Yêu cầu rút tối thiểu 50k, xử lý trong vòng 48h.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
           {/* Info Section */}
           <div className="lg:col-span-2 space-y-6">
              <div className="glass-dark p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all duration-700" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">SỐ DƯ KHẢ DỤNG</p>
                  <p className="text-4xl font-black text-emerald-400 italic">{(profile?.balance || 0).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="flex items-center gap-4 py-4 border-t border-white/5">
                   <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Hạn mức rút ngày</p>
                      <p className="text-sm font-black text-white mt-1">1.000.000đ/ngày</p>
                   </div>
                </div>
              </div>

              <div className="glass p-6 rounded-[30px] border border-white/5 space-y-4">
                 <div className="flex items-center gap-3 text-violet-400">
                    <Info className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Quy định rút tiền</h4>
                 </div>
                 <ul className="space-y-3">
                    <li className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed">
                       <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5" />
                       Rút tối thiểu 50,000 VND / lần.
                    </li>
                    <li className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed">
                       <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5" />
                       Thời gian xử lý: Từ vài phút đến 48h làm việc.
                    </li>
                    <li className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed">
                       <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5" />
                       Đảm bảo thông tin ngân hàng đã được cập nhật chính xác.
                    </li>
                 </ul>
              </div>
           </div>

           {/* Form Section */}
           <div className="lg:col-span-3">
              <form onSubmit={handleWithdraw} className="glass-dark p-8 md:p-12 rounded-[50px] border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Số tiền muốn rút (VNĐ)</label>
                   <div className="relative">
                      <input 
                        required
                        type="number"
                        min={MIN_WITHDRAW}
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-3xl font-black text-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder-slate-800"
                        placeholder="0"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-700 text-xl tracking-tighter">VND</span>
                   </div>
                   <div className="flex gap-2 mt-2 px-2 overflow-x-auto pb-2">
                     {[50000, 100000, 200000, 500000, 1000000].map(val => (
                       <button
                         key={val}
                         type="button"
                         onClick={() => setAmount(val)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all shrink-0",
                           amount === val ? "bg-emerald-500 border-emerald-500 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                         )}
                       >
                         {val.toLocaleString()}đ
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Thông tin nhận tiền (Tự động):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                         <Landmark className="w-3 h-3" /> Ngân hàng
                      </p>
                      <p className="font-black text-white uppercase italic">{profile?.bankCode || 'CHƯA CẬP NHẬT'}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                         <CreditCard className="w-3 h-3" /> Số tài khoản
                      </p>
                      <p className="font-black text-white tracking-widest">{profile?.bankAccountNumber || 'CHƯA CẬP NHẬT'}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1 md:col-span-2">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                         <User className="w-3 h-3" /> Chủ tài khoản
                      </p>
                      <p className="font-black text-white uppercase italic">{profile?.bankAccountName || 'CHƯA CẬP NHẬT'}</p>
                    </div>
                  </div>
                  {!profile?.bankAccountNumber && (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <p className="text-xs font-bold leading-relaxed">Bạn cần cập nhật STK và ngân hàng trong phần cài đặt trước khi rút.</p>
                    </div>
                  )}
                </div>

                <button
                  disabled={loading || !profile?.bankAccountNumber}
                  className="w-full gradient-bg py-5 rounded-[24px] font-black text-white shadow-2xl shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                  YÊU CẦU RÚT TIỀN NGAY
                </button>
              </form>
           </div>
        </div>
      </div>
    </Layout>
  );
}
