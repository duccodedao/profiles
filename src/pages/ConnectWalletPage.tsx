import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AppUser } from '../types';
import Layout from '../components/Layout';
import { 
  Wallet, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ConnectWalletPage() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUserData(snap.data() as AppUser);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [user]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Vui lòng cài đặt Metamask!');
      return;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          walletAddress: address
        });
        setUserData(prev => prev ? { ...prev, walletAddress: address } as any : null);
        toast.success('Kết nối ví thành công!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Kết nối thất bại');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-500" /></div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 py-10">
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-600/20 shadow-2xl shadow-blue-600/10 mb-6"
          >
            <Wallet className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Kết nối ví Web3</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Liên kết ví Metamask để thực hiện các giao dịch nạp/rút tiền điện tử tự động và bảo mật.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="glass-dark p-8 rounded-[40px] border border-white/5 space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-2">
               Tình trạng kết nối
            </h3>

            {userData?.walletAddress ? (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Đã kết nối</p>
                    <p className="text-xs font-mono text-white truncate break-all max-w-[200px]">{userData.walletAddress}</p>
                  </div>
                </div>
                
                <button 
                  onClick={connectWallet}
                  disabled={connecting}
                  className="w-full py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {connecting ? <Loader2 className="animate-spin w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  ĐỔI ĐỊA CHỈ VÍ
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Chưa liên kết</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Bạn chưa liên kết địa chỉ ví Ethereum nào với tài khoản Bmass.</p>
                  </div>
                </div>

                <button 
                  onClick={connectWallet}
                  disabled={connecting}
                  className="w-full gradient-bg py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {connecting ? <Loader2 className="animate-spin w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  KẾT NỐI METAMASK
                </button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="space-y-6">
             <div className="glass-dark p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-violet-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-black text-xs uppercase tracking-widest">Bảo mật tuyệt đối</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bmass không bao giờ yêu cầu khoá bí mật (Private Key) hoặc cụm từ khôi phục (Seed Phrase) của bạn. Quá trình kết nối chỉ chia sẻ địa chỉ ví công khai.
                </p>
             </div>

             <div className="glass-dark p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Info className="w-5 h-5" />
                  <h4 className="font-black text-xs uppercase tracking-widest">Lợi ích liên kết</h4>
                </div>
                <ul className="space-y-2">
                   {[
                     'Nạp USDT tự động không cần admin duyệt',
                     'Rút tiền điện tử trực tiếp về ví cá nhân',
                     'Tham gia các sự kiện Web3 độc quyền',
                     'Xác thực danh tính số (On-chain ID)'
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                        {item}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        <section className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
           <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Hướng dẫn Metamask</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đảm bảo bạn đã cài đặt tiện ích Metamask trên trình duyệt hoặc sử dụng trình duyệt của ứng dụng Metamask trên điện thoại. Hãy chuyển sang mạng **Ethereum Mainnet** để đảm bảo tương thích.
              </p>
           </div>
        </section>
      </div>
    </Layout>
  );
}
