import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Withdrawal } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { CheckCircle2, XCircle, Loader2, User, Clock, Banknote, QrCode, AlertCircle, ExternalLink, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminWithdrawals() {
  const [snapshot, loading] = useCollection(collection(db, 'withdrawals'));
  const withdrawals = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Withdrawal[] | undefined;
  
  const counts = {
    pending: withdrawals?.filter(w => w.status === 'pending').length || 0,
    approved: withdrawals?.filter(w => w.status === 'approved').length || 0,
    paid: withdrawals?.filter(w => w.status === 'paid').length || 0,
    rejected: withdrawals?.filter(w => w.status === 'rejected').length || 0,
    all: withdrawals?.length || 0
  };
  
  const [filter, setFilter] = useState<'pending' | 'approved' | 'paid' | 'rejected' | 'all'>('pending');
  const [selectedQR, setSelectedQR] = useState<Withdrawal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWithdrawals = withdrawals?.filter(w => {
      const matchFilter = filter === 'all' ? true : w.status === filter;
      const matchSearch = searchTerm === '' || 
        w.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.bankAccountNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

  const handleAction = async (withdrawal: Withdrawal, action: 'approve' | 'reject' | 'pay', skipConfirm = false) => {
    let adminNote = '';
    if (action === 'reject') {
      adminNote = window.prompt('Lý do từ chối:') || '';
      if (!adminNote) return;
    } else if (action === 'approve') {
       if (!skipConfirm && !window.confirm('Duyệt yêu cầu rút tiền này? Bạn sẽ cần thanh toán sau đó.')) return;
    } else if (action === 'pay') {
       if (!skipConfirm && !window.confirm('Xác nhận Đã thanh toán cho yêu cầu này? Số dư user sẽ bị trừ ngay lập tức.')) return;
    }

    try {
      const batch = writeBatch(db);
      const subRef = doc(db, 'withdrawals', withdrawal.id!);
      const userRef = doc(db, 'users', withdrawal.userId);
      
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'paid';
      
      batch.update(subRef, {
        status: newStatus,
        adminNote: adminNote || withdrawal.adminNote || '',
        processedAt: serverTimestamp()
      });

      if (action === 'reject') {
        // Refund the balance if rejected since it was deducted on request
        batch.update(userRef, {
          balance: increment(withdrawal.amount)
        });
        
        const transRef = doc(collection(db, 'transactions'));
        batch.set(transRef, {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: `Hoàn tiền: Yêu cầu rút ${withdrawal.amount.toLocaleString()}đ bị từ chối`,
          createdAt: serverTimestamp()
        });
      } else if (action === 'pay' && withdrawal.status !== 'paid') {
        const transRef = doc(collection(db, 'transactions'));
        batch.set(transRef, {
          userId: withdrawal.userId,
          amount: -withdrawal.amount,
          type: 'withdrawal',
          description: `Rút tiền thành công: ${withdrawal.amount.toLocaleString()}đ`,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      toast.success('Thao tác thành công');
    } catch (err) {
      console.error(err);
      toast.error('Thao tác thất bại');
    }
  };

  const getQRUrl = (w: Withdrawal) => {
    // Template link provided: https://img.vietqr.io/image/${currentBank.code}-${currentBank.acc}-${currentTemplate}.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(currentBank.fullName)}
    return `https://img.vietqr.io/image/${w.bankCode}-${w.bankAccountNumber}-compact.jpg?amount=${w.amount}&addInfo=${encodeURIComponent(`Thanh toan #${w.id?.substring(0, 8)}`)}&accountName=${encodeURIComponent(w.bankAccountName)}`;
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="shrink-0">
              <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">Quản lý thanh toán</h1>
              <p className="text-slate-400 mt-1 max-w-sm">Xử lý các yêu cầu rút tiền từ người dùng.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm email, số tài khoản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex flex-wrap bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
                {(['pending', 'approved', 'paid', 'rejected', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-center flex items-center justify-center gap-2",
                      filter === f ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    {f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Chờ thanh toán' : f === 'paid' ? 'Đã thanh toán' : f === 'rejected' ? 'Bị từ chối' : 'Tất cả'}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md text-[9px] font-black",
                      filter === f ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                    )}>
                      {counts[f]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-violet-500" /></div>
            ) : filteredWithdrawals?.length === 0 ? (
              <div className="glass p-10 rounded-3xl text-center text-slate-500 italic border border-white/5">
                Không có yêu cầu rút tiền nào.
              </div>
            ) : (
              filteredWithdrawals?.map((w) => (
                <div key={w.id} className="glass-dark p-6 md:p-8 rounded-[32px] border border-white/5 group hover:border-violet-500/30 transition-all flex flex-col gap-6">
                  
                  {/* Top info and Status Badges */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                        <User className="w-7 h-7 text-violet-300" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg">{w.userName}</p>
                        <p className="text-sm text-slate-400 font-medium">{w.userEmail}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1 flex items-center gap-1.5">
                          Mã GD: #<span className="text-violet-400">{w.id?.substring(0, 8)}</span>
                        </p>
                      </div>
                    </div>

                    {w.status === 'paid' && (
                      <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0">
                         <CheckCircle2 className="w-4 h-4" /> Đã thanh toán
                      </div>
                    )}
                    {w.status === 'rejected' && (
                      <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0">
                         <XCircle className="w-4 h-4" /> Bị từ chối
                      </div>
                    )}
                  </div>

                  {/* Body Content - 3 cols grid + actions */}
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    
                    {/* Payment Info Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-5 w-full rounded-2xl">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Ngân hàng</p>
                        <p className="text-base font-black text-violet-400 uppercase">{w.bankCode}</p>
                      </div>
                      <div className="col-span-1 md:col-span-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Số tài khoản</p>
                        <p className="text-base font-black text-slate-200">{w.bankAccountNumber}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tên chủ thẻ</p>
                        <p className="text-base font-black text-slate-200 uppercase line-clamp-1">{w.bankAccountName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Số tiền rút</p>
                        <p className="text-base font-black text-emerald-400">{(w.amount || 0).toLocaleString()}đ</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {(w.status === 'pending' || w.status === 'approved') && (
                      <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-3 shrink-0">
                        {w.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(w, 'approve')} className="gradient-bg px-8 py-3.5 rounded-2xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                               <CheckCircle2 className="w-4 h-4" /> DUYỆT YÊU CẦU
                            </button>
                            <button onClick={() => handleAction(w, 'reject')} className="bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-3.5 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                               <XCircle className="w-4 h-4" /> TỪ CHỐI
                            </button>
                          </>
                        )}
                        
                        {w.status === 'approved' && (
                          <>
                            <button 
                              onClick={() => setSelectedQR(w)}
                              className="bg-sky-500 hover:bg-sky-400 px-8 py-3.5 rounded-2xl text-xs font-black text-white border border-sky-400/50 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                            >
                              <QrCode className="w-4 h-4" /> QUÉT MÃ VIETQR
                            </button>
                            <button 
                              onClick={() => handleAction(w, 'pay')}
                              className="bg-white/5 border border-white/10 px-8 py-3.5 rounded-2xl text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" /> ĐÃ THANH TOÁN THỦ CÔNG
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Footer Time info */}
                  <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Tạo lúc: {w.createdAt?.toDate?.()?.toLocaleString?.('vi-VN') || 'Đang tải...'}</div>
                    {w.processedAt && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Khớp lệnh: {w.processedAt?.toDate?.()?.toLocaleString?.('vi-VN') || 'Đang tải...'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* VietQR Modal */}
        <AnimatePresence>
          {selectedQR && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedQR(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-10 max-w-4xl w-full max-h-[95vh] overflow-y-auto glass-dark p-2 rounded-[40px] border border-white/10 shadow-2xl"
              >
                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Left Column: QR Code */}
                  <div className="space-y-6 flex flex-col items-center justify-center bg-white/5 p-6 rounded-[32px] border border-white/5">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <QrCode className="w-8 h-8 text-emerald-400" />
                    </div>
                    
                    <div className="bg-white p-3 rounded-3xl w-full max-w-[280px]">
                      <img 
                        src={getQRUrl(selectedQR)} 
                        alt="VietQR" 
                        className="w-full h-auto rounded-2xl" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-black text-white uppercase italic">MÃ THANH TOÁN</h3>
                      <p className="text-slate-400 text-xs mt-1">Sử dụng ứng dụng ngân hàng và quét</p>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="flex flex-col justify-center space-y-8">
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight mb-2">Chi tiết giao dịch</h3>
                      <p className="text-slate-400 text-sm font-medium">Kiểm tra kỹ thông tin trước khi thực hiện chuyển khoản cho thành viên.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="glass bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                        <p className="text-4xl font-black text-emerald-400">{(selectedQR.amount || 0).toLocaleString()}đ</p>
                      </div>

                      <div className="glass bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-colors">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Người nhận</p>
                        <p className="text-xl font-black text-white uppercase mb-1">{selectedQR.bankAccountName}</p>
                        <p className="text-sm font-medium text-slate-400">{selectedQR.bankCode} • {selectedQR.bankAccountNumber}</p>
                      </div>

                      <div className="glass bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-colors">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nội dung chuyển khoản</p>
                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                          <p className="text-sm font-mono font-bold text-violet-400">Thanh toan #{selectedQR.id?.substring(0, 8)}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`Thanh toan #${selectedQR.id?.substring(0, 8)}`);
                              toast.success('Đã copy nội dung!');
                            }}
                            className="text-[10px] font-bold bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            COPY
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => {
                          handleAction(selectedQR, 'pay', true);
                          setSelectedQR(null);
                        }}
                        className="flex-1 bg-emerald-500 py-4 rounded-2xl text-xs font-black text-white hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> XÁC NHẬN ĐÃ THANH TOÁN
                      </button>
                      <button 
                        onClick={() => setSelectedQR(null)}
                        className="px-6 py-4 rounded-2xl text-xs font-black text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10"
                      >
                        ĐÓNG
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AdminLayout>
    </Layout>
  );
}
