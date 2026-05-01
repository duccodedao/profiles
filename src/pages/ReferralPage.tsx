import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { AppUser } from '../types';
import Layout from '../components/Layout';
import { Share2, Copy, Users, CheckCircle2, AlertCircle, Link as LinkIcon, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = React.useState<AppUser | null>(null);
  const [referrals, setReferrals] = React.useState<AppUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch profile
          const pSnap = await getDoc(doc(db, 'users', user.uid));
          if (pSnap.exists()) {
            const pData = pSnap.data() as AppUser;
            setProfile(pData);
            
            // Fetch referrals based on my code
            const rSnap = await getDocs(query(collection(db, 'users'), where('invitedBy', '==', pData.referralCode)));
            setReferrals(rSnap.docs.map(doc => doc.data() as AppUser));
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã copy vào bộ nhớ tạm!');
  };

  if (loading) return null;
  if (!user || !profile) return null;

  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/login?ref=${profile.referralCode}`;
  
  const successfulReferrals = referrals.filter(r => r.isVerified).length;

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-xl">
            <Share2 className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Chương trình Giới thiệu</h1>
            <p className="text-slate-500">Mời bạn bè tham gia và nhận thêm ưu đãi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* My Code & Link */}
          <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-violet-400" />
                Link giới thiệu của tôi
              </h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 font-mono text-sm truncate">
                  {referralLink}
                </div>
                <button 
                  onClick={() => copyToClipboard(referralLink)}
                  className="bg-violet-500 hover:bg-violet-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Mã giới thiệu (Ref Code)
              </h3>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-violet-400 font-black tracking-[0.3em] text-2xl text-center">
                  {profile.referralCode}
                </div>
                <button 
                  onClick={() => copyToClipboard(profile.referralCode)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                Lưu ý quan trọng
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Người được giới thiệu phải **xác minh tài khoản thành công** (Admin duyệt) thì mới được tính là một lượt giới thiệu hợp lệ.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6">
            <div className="glass-dark border border-white/5 rounded-3xl p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng giới thiệu</p>
                <div className="text-4xl font-black text-white mt-1">{referrals.length}</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-3xl p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Thành công (Đã xác minh)</p>
                <div className="text-4xl font-black text-white mt-1">{successfulReferrals}</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass-dark border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
               <h4 className="text-sm font-bold text-white mb-2">Quyền lợi của bạn</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Tỉ lệ hoa hồng sẽ được hệ thống tính toán dựa trên số lượng người giới thiệu thành công. Hãy tích cực chia sẻ link của bạn!
               </p>
            </div>
          </div>
        </div>

        {/* List of Invited Users */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
               <Users className="w-5 h-5 text-violet-400" />
               Danh sách đã giới thiệu
            </h2>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {referrals.length} thành viên
            </div>
          </div>

          <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Thành viên</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic">Bạn chưa giới thiệu ai. Hãy bắt đầu ngay!</td>
                  </tr>
                ) : (
                  referrals.map((ref, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={ref.photoURL} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                          <span className="font-bold text-slate-200">{ref.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{ref.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {ref.isVerified ? (
                            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Thành công
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-white/5 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" />
                              Chờ xác minh
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                           <Calendar className="w-3.5 h-3.5" />
                           {new Intl.DateTimeFormat('vi-VN').format(ref.createdAt?.toDate ? ref.createdAt.toDate() : new Date())}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
