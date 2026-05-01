import React from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { AppUser } from '../types';
import { cn } from '../lib/utils';
import { Users, Mail, Calendar, Shield, User as UserIcon, Tag, UserCheck, UserX, Loader2, Ban, Hammer, Monitor, Globe, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [snapshot, loading] = useCollection(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  const users = snapshot?.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as AppUser[] | undefined;
  
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = users?.filter(u => 
    searchTerm === '' || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleVerify = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: !currentStatus
      });
      toast.success(!currentStatus ? 'Đã cấp tích xanh' : 'Đã gỡ tích xanh');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    } finally {
      setUpdating(null);
    }
  };

  const toggleBan = async (user: AppUser) => {
    const isBanning = !user.isBanned;
    setUpdating(user.uid);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isBanned: isBanning
      });

      // Also add to/remove from global blacklist for IP/Device
      if (isBanning) {
        if (user.lastIp) {
          await setDoc(doc(db, 'blacklist', `ip_${user.lastIp.replace(/\./g, '_')}`), {
            type: 'ip',
            value: user.lastIp,
            bannedAt: new Date(),
            userId: user.uid
          });
        }
        if (user.deviceId) {
          await setDoc(doc(db, 'blacklist', `device_${user.deviceId}`), {
            type: 'device',
            value: user.deviceId,
            bannedAt: new Date(),
            userId: user.uid
          });
        }
      } else {
        // Unbanning: attempts to remove from blacklist (best effort)
        if (user.lastIp) {
          await deleteDoc(doc(db, 'blacklist', `ip_${user.lastIp.replace(/\./g, '_')}`));
        }
        if (user.deviceId) {
          await deleteDoc(doc(db, 'blacklist', `device_${user.deviceId}`));
        }
      }
      toast.success(isBanning ? 'Đã khóa tài khoản & thiết bị' : 'Đã mở khóa tài khoản');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (date: any) => {
    if (!date?.toDate) return '---';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date.toDate());
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
                <Users className="text-violet-400 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
                <p className="text-slate-500 text-sm">Xem và quản lý danh sách thành viên trên hệ thống</p>
              </div>
            </div>
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm email, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm placeholder-slate-500"
              />
            </div>
          </div>

          <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Người dùng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Quyền hạn</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-emerald-400">Số dư</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">IP / Thiết bị</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Mã cá nhân</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Xác minh</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-white/5 rounded-xl w-full"></div></td>
                    </tr>
                  ))
                ) : filteredUsers?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-slate-500">Chưa có người dùng nào đăng ký hoặc phù hợp với tìm kiếm</td>
                  </tr>
                ) : (
                  filteredUsers?.map((user) => (
                    <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                          <div>
                            <div className="font-bold text-slate-200">{user.displayName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit",
                          user.role === 'admin' ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        )}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-emerald-400 text-xs tracking-tighter">
                          {(user.balance || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                             <Globe className="w-3 h-3 text-slate-500" />
                             {user.lastIp || '---'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                             <Monitor className="w-3 h-3" />
                             {user.deviceId?.substring(0, 12)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-blue-400 font-bold tracking-widest">
                        {user.referralCode}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex justify-center">
                            <button
                              disabled={updating === user.uid}
                              onClick={() => toggleVerify(user.uid, user.isVerified)}
                              className={cn(
                                "p-2 rounded-xl transition-all border",
                                user.isVerified 
                                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400" 
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-blue-500/20"
                              )}
                              title={user.isVerified ? "Hủy xác minh" : "Xác minh ngay"}
                            >
                              {updating === user.uid ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.isVerified ? (
                                <UserCheck className="w-4 h-4" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                           <button
                             disabled={updating === user.uid || user.role === 'admin'}
                             onClick={() => toggleBan(user)}
                             className={cn(
                               "p-2 rounded-xl transition-all border",
                               user.isBanned 
                                 ? "bg-red-500/20 border-red-500/30 text-red-500 hover:bg-slate-500/10 hover:border-white/10" 
                                 : "bg-slate-500/5 border-white/5 text-slate-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500"
                             )}
                             title={user.isBanned ? "Gỡ Ban" : "Ban người dùng"}
                           >
                             {updating === user.uid ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                             ) : user.isBanned ? (
                               <Ban className="w-4 h-4" />
                             ) : (
                               <Hammer className="w-4 h-4" />
                             )}
                           </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs text-slate-400 flex items-center justify-end gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
