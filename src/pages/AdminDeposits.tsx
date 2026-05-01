import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deposit } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { CheckCircle2, XCircle, Loader2, User, Clock, Banknote, Search, Wallet, Coins, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDeposits() {
  const [snapshot, loading] = useCollection(collection(db, 'deposits'));
  const deposits = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deposit[] | undefined;
  
  const counts = {
    pending: deposits?.filter(d => d.status === 'pending').length || 0,
    approved: deposits?.filter(d => d.status === 'approved').length || 0,
    rejected: deposits?.filter(d => d.status === 'rejected').length || 0,
    all: deposits?.length || 0
  };
  
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeposits = deposits?.filter(d => {
      const matchFilter = filter === 'all' ? true : d.status === filter;
      const matchSearch = searchTerm === '' || 
        d.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.id && d.id.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchFilter && matchSearch;
    })
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

  const handleAction = async (deposit: Deposit, action: 'approve' | 'reject') => {
    let adminNote = '';
    if (action === 'reject') {
      adminNote = window.prompt('Lý do từ chối:') || '';
      if (!adminNote) return;
    } else if (action === 'approve') {
       if (!window.confirm(`Phê duyệt nạp ${(deposit.amountVnd || 0).toLocaleString()}đ ? Số dư user sẽ được cộng ngay.`)) return;
    }

    try {
      const batch = writeBatch(db);
      const depRef = doc(db, 'deposits', deposit.id!);
      const userRef = doc(db, 'users', deposit.userId);
      
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      batch.update(depRef, {
        status: newStatus,
        adminNote: adminNote || deposit.adminNote || '',
        processedAt: serverTimestamp()
      });

      if (action === 'approve') {
        // Add balance and totalEarned
        batch.update(userRef, {
          balance: increment(deposit.amountVnd),
          totalEarned: increment(deposit.amountVnd)
        });
        
        const transRef = doc(collection(db, 'transactions'));
        batch.set(transRef, {
          userId: deposit.userId,
          amount: deposit.amountVnd,
          type: 'deposit',
          description: `Nạp tiền thành công (VietQR): +${(deposit.amountVnd || 0).toLocaleString()}đ`,
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

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="shrink-0">
              <h1 className="text-3xl font-bold tracking-tight whitespace-nowrap">Quản lý Nạp tiền</h1>
              <p className="text-slate-400 mt-1 max-w-sm">Phê duyệt các yêu cầu nạp tiền từ người dùng.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm email, mã đơn, TXID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex flex-wrap bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap text-center flex items-center justify-center gap-2",
                      filter === f ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    {f === 'pending' ? 'Chờ duyệt' : f === 'approved' ? 'Thành công' : f === 'rejected' ? 'Bị từ chối' : 'Tất cả'}
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
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : filteredDeposits?.length === 0 ? (
              <div className="glass p-10 rounded-3xl text-center text-slate-500 italic border border-white/5">
                Không có yêu cầu nạp tiền nào.
              </div>
            ) : (
              filteredDeposits?.map((d) => (
                <div key={d.id} className="glass-dark p-6 md:p-8 rounded-[32px] border border-white/5 group hover:border-emerald-500/30 transition-all flex flex-col gap-6">
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                        {d.method === 'bank' ? <CreditCard className="w-7 h-7 text-emerald-300" /> : <Coins className="w-7 h-7 text-blue-300" />}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg">{d.userName}</p>
                        <p className="text-sm text-slate-400 font-medium">{d.userEmail}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1 flex items-center gap-1.5">
                          Mã Đơn: #<span className="text-emerald-400">{d.id?.substring(0, 10).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-black text-white">{(d.amountVnd || 0).toLocaleString()}đ</p>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        d.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        d.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {d.status === 'pending' ? 'Đang chờ' : d.status === 'approved' ? 'Thành công' : 'Bị từ chối'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 p-5 w-full rounded-2xl">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Phương thức</p>
                        <p className="text-sm font-black text-emerald-400 uppercase">VietQR</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nội dung chuyển khoản</p>
                        <p className="text-xs font-mono text-slate-400 break-all">{`NAP ${d.id?.substring(0, 10).toUpperCase()}`}</p>
                      </div>
                    </div>

                    {d.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-3 shrink-0">
                        <button onClick={() => handleAction(d, 'approve')} className="bg-emerald-500 hover:bg-emerald-400 px-8 py-3.5 rounded-2xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> DUYỆT NẠP TIỀN
                        </button>
                        <button onClick={() => handleAction(d, 'reject')} className="bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-3.5 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                           <XCircle className="w-4 h-4" /> TỪ CHỐI
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Yêu cầu: {d.createdAt?.toDate?.()?.toLocaleString?.('vi-VN') || 'Đang tải...'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
