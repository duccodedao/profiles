import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Transaction, Withdrawal } from '../types';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { History, ArrowUpRight, ArrowDownLeft, Loader2, Coins, UserCheck, Smartphone, Ban, Banknote, AlertCircle, Search, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TransactionsPage() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'all' | 'referral' | 'task' | 'withdrawal' | 'deposit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transQuery = user ? query(
    collection(db, 'transactions'),
    where('userId', '==', user.uid)
  ) : null;

  const withdrawQuery = user ? query(
    collection(db, 'withdrawals'),
    where('userId', '==', user.uid)
  ) : null;

  const [transactions, loadingTrans] = useCollectionData(transQuery) as unknown as [Transaction[] | undefined, boolean, ...any[]];
  const [withdrawals, loadingWithdraw] = useCollectionData(withdrawQuery) as unknown as [Withdrawal[] | undefined, boolean, ...any[]];

  const sortedTransactions = transactions?.slice().sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0;
    const bTime = b.createdAt?.toMillis() || 0;
    return bTime - aTime;
  });

  const sortedWithdrawals = withdrawals?.slice().sort((a, b) => {
    const aTime = a.createdAt?.toMillis() || 0;
    const bTime = b.createdAt?.toMillis() || 0;
    return bTime - aTime;
  });

  const filteredTrans = sortedTransactions?.filter(t => {
      const matchTab = activeTab === 'all' ? true : t.type === activeTab;
      const matchSearch = searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'referral': return <UserCheck className="w-5 h-5 text-blue-400" />;
      case 'commission': return <Smartphone className="w-5 h-5 text-pink-400" />;
      case 'task': return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'withdrawal': return <Banknote className="w-5 h-5 text-amber-400" />;
      case 'bonus': return <Coins className="w-5 h-5 text-violet-400" />;
      case 'deposit': return <Wallet className="w-5 h-5 text-emerald-400" />;
      case 'penalty': return <Ban className="w-5 h-5 text-red-400" />;
      default: return <Coins className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 space-y-12">
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-violet-600/10 rounded-[20px] flex items-center justify-center mx-auto border border-violet-600/20 mb-6 font-black text-violet-400 italic">
            $
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Lịch sử giao dịch</h1>
          <p className="text-slate-400 font-medium">Theo dõi mọi biến động số dư và yêu cầu rút tiền của bạn.</p>
        </section>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-2 rounded-3xl border border-white/5 mx-auto max-w-full">
            <div className="flex w-full overflow-x-auto">
              {(['all', 'referral', 'task', 'withdrawal', 'deposit'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1",
                    activeTab === tab ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab === 'all' ? 'Tất cả' : tab === 'referral' ? 'Giới thiệu' : tab === 'task' ? 'Nhiệm vụ' : tab === 'withdrawal' ? 'Rút tiền' : 'Nạp tiền'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0 px-2 pb-2 md:px-0 md:pb-0 md:pr-2">
              <Search className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 md:-translate-y-1/2 text-slate-500 w-4 h-4 ml-2 md:ml-0" />
              <input
                type="text"
                placeholder="Tìm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-12 md:pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transactions List */}
            <div className="lg:col-span-2 space-y-4">
               <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] pl-4">BIẾN ĐỘNG SỐ DƯ</h3>
               <div className="space-y-3">
                  {loadingTrans ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" /></div>
                  ) : filteredTrans?.length === 0 ? (
                    <div className="glass p-10 rounded-[30px] border border-white/5 text-center text-slate-500 italic">
                      Chưa có giao dịch nào được ghi nhận.
                    </div>
                  ) : filteredTrans?.map((t, i) => (
                    <motion.div
                      key={t.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-dark p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-violet-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                           {getIcon(t.type)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm leading-tight">{t.description}</p>
                          <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">
                             {t.createdAt?.toDate?.()?.toLocaleString?.('vi-VN') || 'Đang tải...'}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-black italic",
                        t.amount > 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {t.amount > 0 ? '+' : ''}{(t.amount || 0).toLocaleString()}đ
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Withdrawals Status */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] pl-4">YÊU CẦU RÚT TIỀN</h3>
               <div className="space-y-4">
                  {loadingWithdraw ? (
                     <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" /></div>
                  ) : sortedWithdrawals?.length === 0 ? (
                    <div className="glass p-10 rounded-[30px] border border-white/5 text-center text-slate-500 italic">
                       Chưa có yêu cầu rút tiền.
                    </div>
                  ) : sortedWithdrawals?.map((w, i) => (
                    <div key={w.id || i} className="glass border border-white/5 p-6 rounded-[30px] space-y-4">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Số tiền rút</p>
                             <p className="text-xl font-black text-white italic">{w.amount.toLocaleString()}đ</p>
                          </div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            w.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            w.status === 'approved' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                            w.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                             {w.status === 'pending' ? 'Chờ duyệt' : w.status === 'approved' ? 'Chờ chi' : w.status === 'paid' ? 'Thành công' : 'Bị từ chối'}
                          </span>
                       </div>
                       
                       {w.adminNote && (
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 text-[10px] leading-relaxed text-slate-400 italic">
                             <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                             <span>Ghi chú: {w.adminNote}</span>
                          </div>
                       )}

                       <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <span>{w.createdAt?.toDate().toLocaleDateString('vi-VN')}</span>
                          <span className="opacity-30">#{w.id?.substring(0, 8)}</span>
                       </div>
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

const CheckSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
