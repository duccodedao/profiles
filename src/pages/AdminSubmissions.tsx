import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, distributeCommission } from '../lib/firebase';
import { TaskSubmission } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { CheckCircle2, XCircle, Loader2, User, Clock, MessageSquare, ExternalLink, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminSubmissions() {
  const [snapshot, loading] = useCollection(collection(db, 'taskSubmissions'));
  const submissions = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TaskSubmission[] | undefined;
  
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubmissions = submissions?.filter(s => {
      const matchFilter = filter === 'all' ? true : s.status === filter;
      const matchSearch = searchTerm === '' || 
        s.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

  const handleAction = async (submission: TaskSubmission, action: 'approve' | 'reject') => {
    const adminNote = window.prompt(action === 'approve' ? 'Ghi chú phê duyệt (Tùy chọn):' : 'Lý do từ chối (Bắt buộc):');
    
    if (action === 'reject' && !adminNote) {
      toast.error('Cần có lý do để từ chối nhiệm vụ');
      return;
    }

    try {
      const batch = writeBatch(db);
      const subRef = doc(db, 'taskSubmissions', submission.id!);
      
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      batch.update(subRef, {
        status: newStatus,
        adminNote: adminNote || '',
        updatedAt: serverTimestamp()
      });

      if (action === 'approve') {
        // 1. Pay reward to user
        const userRef = doc(db, 'users', submission.userId);
        batch.update(userRef, {
          balance: increment(submission.reward),
          totalEarned: increment(submission.reward)
        });

        // 2. Log Transaction
        const transRef = doc(collection(db, 'transactions'));
        batch.set(transRef, {
          userId: submission.userId,
          amount: submission.reward,
          type: 'task',
          description: `Hoàn thành nhiệm vụ: ${submission.taskTitle}`,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      // 3. Handle commissions (Sync distribute)
      if (action === 'approve') {
        await distributeCommission(submission.userId, submission.reward, `Nhiệm vụ: ${submission.taskTitle}`);
      }

      toast.success(action === 'approve' ? 'Đã duyệt nhiệm vụ' : 'Đã từ chối nhiệm vụ');
    } catch (err) {
      console.error(err);
      toast.error('Thao tác thất bại');
    }
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Phê duyệt nhiệm vụ</h1>
              <p className="text-slate-400 mt-1">Duyệt các bằng chứng hoàn thành nhiệm vụ từ người dùng.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm email, nhiệm vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm placeholder-slate-500"
                />
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      filter === f ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {f === 'pending' ? 'Chưa duyệt' : f === 'approved' ? 'Đã duyệt' : f === 'rejected' ? 'Bị từ chối' : 'Tất cả'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-violet-500" /></div>
            ) : filteredSubmissions?.length === 0 ? (
              <div className="glass p-10 rounded-3xl text-center text-slate-500 italic border border-white/5">
                Không có yêu cầu nào trong danh sách.
              </div>
            ) : (
              filteredSubmissions?.map((sub) => (
                <div key={sub.id} className="glass-dark p-8 rounded-[40px] border border-white/5 space-y-6 group hover:border-violet-500/20 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center border border-violet-600/20">
                          <User className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-black text-white">{sub.userName}</p>
                          <p className="text-xs text-slate-500">{sub.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">{sub.createdAt?.toDate().toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">Thưởng: {sub.reward.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAction(sub, 'reject')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 text-xs font-black transition-all hover:text-white"
                          >
                            <XCircle className="w-4 h-4" />
                            TỪ CHỐI
                          </button>
                          <button
                             onClick={() => handleAction(sub, 'approve')}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 text-xs font-black transition-all hover:text-white shadow-xl shadow-emerald-500/10"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            DUYỆT CHI
                          </button>
                        </>
                      ) : (
                        <div className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                          sub.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                          {sub.status === 'approved' ? 'Đã duyệt thành công' : 'Đã từ chối'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-violet-400 italic">
                       <Filter className="w-4 h-4" />
                       <h4 className="text-sm font-bold uppercase tracking-widest">Chi tiết nhiệm vụ: {sub.taskTitle}</h4>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-3">Bằng chứng gửi lên:</p>
                      <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {sub.proof}
                      </div>
                    </div>
                    
                    {sub.adminNote && (
                      <div className={cn(
                        "p-6 rounded-2xl border flex gap-4 items-start",
                        sub.status === 'approved' ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                      )}>
                        <Info className={cn("w-5 h-5", sub.status === 'approved' ? "text-emerald-500" : "text-red-500")} />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Ghi chú quản trị:</p>
                          <p className="text-slate-300 text-xs italic">"{sub.adminNote}"</p>
                        </div>
                      </div>
                    )}
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

const Info = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
