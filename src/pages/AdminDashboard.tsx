import React from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { Project, AppUser, Withdrawal, TaskSubmission } from '../types';
import { Briefcase, BarChart3, TrendingUp, Users, CheckSquare, Banknote } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [projects] = useCollectionData(collection(db, 'projects')) as unknown as [Project[] | undefined, boolean];
  const [users] = useCollectionData(collection(db, 'users')) as unknown as [AppUser[] | undefined, boolean];
  const [withdrawals] = useCollectionData(collection(db, 'withdrawals')) as unknown as [Withdrawal[] | undefined, boolean];
  const [submissions] = useCollectionData(collection(db, 'taskSubmissions')) as unknown as [TaskSubmission[] | undefined, boolean];

  const stats = [
    { label: 'Dự án', value: projects?.length || 0, icon: Briefcase, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Thành viên', value: users?.length || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Phê duyệt', value: submissions?.filter(s => s.status === 'pending').length || 0, icon: CheckSquare, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Cần thanh toán', value: withdrawals?.filter(w => w.status === 'approved').length || 0, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trang chủ Admin</h1>
            <p className="text-slate-400 mt-1">Tổng quan về hệ thống và dữ liệu dự án.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl"
              >
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-dark rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold mb-4">Hoạt động gần đây</h3>
              <div className="space-y-4">
                {projects?.slice(0, 5).map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{p.title}</p>
                      <p className="text-xs text-slate-500">Đã cập nhật dự án</p>
                    </div>
                    <span className="text-[10px] text-slate-600 bg-white/5 px-2 py-1 rounded">Vừa xong</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 border border-white/5 flex items-center justify-center min-h-[300px] text-slate-500 italic">
              Biểu đồ thống kê sẽ sớm được cập nhật...
            </div>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
