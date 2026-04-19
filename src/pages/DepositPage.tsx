import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { PaymentConfig } from '../types';
import Layout from '../components/Layout';
import { 
  CreditCard, 
  Wallet, 
  ChevronRight, 
  QrCode, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const [user] = useAuthState(auth);
  const [payment, setPayment] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [amountVnd, setAmountVnd] = useState<number>(50000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'qr'>('input');
  const [pendingDepositId, setPendingDepositId] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, 'settings', 'payment'));
      if (snap.exists()) {
        const data = snap.data() as PaymentConfig;
        setPayment(data);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã copy!');
  };

  const handleCreateRequest = async () => {
    if (!user || !payment) return;
    if (amountVnd < 10000) {
      toast.error('Nạp tối thiểu 10,000đ');
      return;
    }
    if (amountVnd > 100000000) {
      toast.error('Nạp tối đa 100,000,000đ');
      return;
    }

    setIsProcessing(true);
    try {
      const depRef = doc(collection(db, 'deposits'));
      await setDoc(depRef, {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        amountVnd: Math.floor(amountVnd),
        method: 'bank',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setPendingDepositId(depRef.id);
      setStep('qr');
      toast.success('Đã tạo yêu cầu nạp tiền!');
    } catch (e) {
      toast.error('Lỗi khi tạo yêu cầu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDone = () => {
    toast.success('Cảm ơn bạn! Admin sẽ kiểm tra và cộng tiền trong giây lát.');
    setStep('input');
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" /></div></Layout>;

  if (!payment?.bankCode || !payment?.bankAccountNumber) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/10 rounded-[30px] flex items-center justify-center mx-auto border border-amber-500/20 shadow-2xl shadow-amber-500/10">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Hệ thống chưa cấu hình</h2>
            <p className="text-slate-400 font-medium">Vui lòng liên hệ Admin để cấu hình thông tin ngân hàng nạp tiền.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const orderId = pendingDepositId.substring(0, 10).toUpperCase();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 py-10">
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-emerald-600/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-600/20 shadow-2xl shadow-emerald-600/10 mb-6"
          >
            <Wallet className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter text-center">Nạp tiền vào ví</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Chuyển khoản VietQR để gia tăng số dư và bắt đầu kiếm tiền ngay hôm nay.
          </p>
        </section>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-dark p-8 md:p-12 rounded-[50px] border border-white/10 space-y-10 relative overflow-hidden"
            >
               <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    VietQR / Chuyển khoản ngân hàng
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                    Nhập số tiền muốn nạp (VNĐ)
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">
                          Số tiền nạp (Min: 10,000đ)
                        </label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="10000"
                            step="1000"
                            value={amountVnd}
                            onChange={e => setAmountVnd(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-3xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">VNĐ</span>
                        </div>
                     </div>

                     <div className="flex gap-2 overflow-x-auto pb-2">
                       {[50000, 100000, 200000, 500000, 1000000].map(val => (
                         <button
                           key={val}
                           onClick={() => setAmountVnd(val)}
                           className={cn(
                             "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all shrink-0",
                             amountVnd === val ? "bg-emerald-500 border-emerald-500 text-white shadow-lg" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                           )}
                         >
                           {val.toLocaleString()}đ
                         </button>
                       ))}
                     </div>

                     <button
                        onClick={handleCreateRequest}
                        disabled={isProcessing}
                        className="w-full gradient-bg py-5 rounded-2xl text-white font-black text-lg shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                        TẠO MÃ NẠP TIỀN
                     </button>
                  </div>

                  <div className="glass bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6 flex flex-col justify-center">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hướng dẫn nạp tiền</h4>
                        <div className="space-y-4">
                           <div className="flex gap-4">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                                 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">Hệ thống tạo mã QR động chứa sẵn số tiền và nội dung chuyển khoản.</p>
                           </div>
                           <div className="flex gap-4">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                                 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">Hỗ trợ thanh toán nhanh 24/7 tới tất cả ngân hàng tại Việt Nam.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="qr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-dark p-8 md:p-12 rounded-[50px] border border-white/10 space-y-10 relative overflow-hidden"
            >
               <button 
                onClick={() => setStep('input')}
                className="absolute top-8 left-8 p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold"
               >
                  <ChevronRight className="w-5 h-5 rotate-180" />
               </button>

               <div className="max-w-md mx-auto space-y-8 text-center pt-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Thanh toán VietQR</h2>
                    <p className="text-slate-400 text-sm font-medium">Sử dụng ứng dụng ngân hàng quét mã bên dưới</p>
                  </div>

                  <div className="bg-white p-6 rounded-[40px] shadow-2xl shadow-emerald-500/20 relative group overflow-hidden">
                     <img 
                        src={`https://img.vietqr.io/image/${payment?.bankCode}-${payment?.bankAccountNumber.replace(/\s/g, '')}-compact.jpg?amount=${amountVnd}&addInfo=${encodeURIComponent(`NAP ${orderId}`)}&accountName=${encodeURIComponent(payment?.bankAccountName || '')}`}
                        alt="VietQR" 
                        className="w-full h-auto rounded-3xl" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  <div className="space-y-4">
                     <div className="glass bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4 text-left">
                        {[
                          { label: 'Ngân hàng', value: payment?.bankName },
                          { label: 'Chủ tài khoản', value: payment?.bankAccountName },
                          { label: 'Số tài khoản', value: payment?.bankAccountNumber },
                          { label: 'Nội dung', value: `NAP ${orderId}` },
                          { label: 'Số tiền', value: `${amountVnd.toLocaleString()}đ` }
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.label}</span>
                            <div className="flex items-center justify-between group">
                               <span className={cn(
                                 "font-black tracking-tight",
                                 item.label === 'Số tiền' ? "text-emerald-400 text-lg" : "text-white text-sm"
                               )}>{item.value || '---'}</span>
                               <button onClick={() => handleCopy(item.value?.replace(/[^\d\w\s]/g, '') || '')} className="text-slate-600 hover:text-emerald-400 transition-colors">
                                 <Copy className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          </div>
                        ))}
                     </div>

                     <button
                        onClick={handleConfirmDone}
                        className="w-full gradient-bg py-5 rounded-[30px] text-white font-black text-lg shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                     >
                        <CheckCircle2 className="w-6 h-6" />
                        TÔI ĐÃ CHUYỂN KHOẢN
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
           <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Lưu ý quan trọng</h4>
              <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold">
                 Vui lòng chuyển chính xác số tiền và nội dung chuyển khoản để hệ thống tự động nhận diện đơn hàng nhanh nhất. Thời gian xử lý từ 1-5 phút.
              </p>
           </div>
        </section>
      </div>
    </Layout>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
