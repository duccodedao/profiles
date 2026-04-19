import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GithubConfig, SocialConfig, PaymentConfig } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { Github, Save, Loader2, Info, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<GithubConfig>({
    username: '',
    repo: '',
    branch: 'main',
    folder: 'images',
    accessToken: ''
  });

  const [social, setSocial] = useState<SocialConfig>({
    facebook: '',
    telegram: '',
    zalo: '',
    email: 'sonlyhongduc@gmail.com'
  });

  const [contact, setContact] = useState({
    address: '',
    phone: '',
    description: ''
  });

  const [payment, setPayment] = useState<PaymentConfig>({
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    adminWalletAddress: '',
    usdtToVndRate: 25000
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      // ... existing code ...
      const githubSnap = await getDoc(doc(db, 'settings', 'github'));
      if (githubSnap.exists()) {
        setConfig(prev => ({ ...prev, ...githubSnap.data() }));
      }
      
      const socialSnap = await getDoc(doc(db, 'settings', 'social'));
      if (socialSnap.exists()) {
        setSocial(prev => ({ ...prev, ...socialSnap.data() }));
      }

      const contactSnap = await getDoc(doc(db, 'settings', 'contact'));
      if (contactSnap.exists()) {
        setContact(prev => ({ ...prev, ...contactSnap.data() }));
      }

      const paymentSnap = await getDoc(doc(db, 'settings', 'payment'));
      if (paymentSnap.exists()) {
        setPayment(prev => ({ ...prev, ...paymentSnap.data() }));
      }
      
      setFetching(false);
    };
    fetchConfigs();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'payment'), payment);
      toast.success('Thanh toán: Đã lưu cấu hình');
    } catch (err) {
      toast.error('Thanh toán: Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSubmit = async (e: React.FormEvent) => {
    // ... same as before but I'll update it to use toast ...
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'github'), config);
      toast.success('GitHub: Đã lưu cấu hình');
    } catch (err) {
      toast.error('GitHub: Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'social'), social);
      toast.success('Social: Đã lưu cấu hình');
    } catch (err) {
      toast.error('Social: Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'contact'), contact);
      toast.success('Liên hệ: Đã lưu cấu hình');
    } catch (err) {
      toast.error('Liên hệ: Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></Layout>;

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-12">
          {/* GitHub Config */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cấu hình GitHub</h1>
              <p className="text-slate-400 mt-1">Thông tin kết nối GitHub để lưu trữ hình ảnh dự án.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleGithubSubmit} className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                  {/* ... Existing GitHub Form Fields ... */}
                  <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <Github className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Repository Details</h3>
                      <p className="text-xs text-slate-500">Kết nối repository GitHub của bạn</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub Username</label>
                      <input
                        required
                        value={config.username}
                        onChange={e => setConfig(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="vd: sonlyhongduc"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Repo Name</label>
                      <input
                        required
                        value={config.repo}
                        onChange={e => setConfig(prev => ({ ...prev, repo: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="vd: my-affiliate-assets"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Branch</label>
                      <input
                        value={config.branch}
                        onChange={e => setConfig(prev => ({ ...prev, branch: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="main"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Folder Path</label>
                      <input
                        value={config.folder}
                        onChange={e => setConfig(prev => ({ ...prev, folder: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="images/projects"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GitHub Access Token (PAT)</label>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        required
                        value={config.accessToken}
                        onChange={e => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 pr-12"
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      className="gradient-bg w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      LƯU GITHUB
                    </button>
                  </div>
                </form>
              </div>
              <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-violet-400">
                  <Info className="w-5 h-5" />
                  <h4 className="font-bold">Hướng dẫn GitHub</h4>
                </div>
                <div className="space-y-3 text-sm text-slate-400">
                  <p>Sử dụng repository GitHub để lưu trữ ảnh project vĩnh viễn và hoàn toàn miễn phí.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Payment Config */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cấu hình Nạp tiền (Payment)</h1>
              <p className="text-slate-400 mt-1">Thông tin ngân hàng và địa chỉ ví Admin để nhận tiền nạp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handlePaymentSubmit} className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên ngân hàng</label>
                      <input
                        value={payment.bankName}
                        onChange={e => setPayment(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none"
                        placeholder="VD: Vietcombank"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Số tài khoản</label>
                      <input
                        value={payment.bankAccountNumber}
                        onChange={e => setPayment(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none"
                        placeholder="VD: 123456789"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Chủ tài khoản</label>
                    <input
                      value={payment.bankAccountName}
                      onChange={e => setPayment(prev => ({ ...prev, bankAccountName: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none"
                      placeholder="VD: NGUYEN VAN A"
                    />
                  </div>
                  
                  <div className="h-px bg-white/5 my-4" />
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Địa chỉ ví Admin (Ethereum/ERC20)</label>
                    <input
                      value={payment.adminWalletAddress}
                      onChange={e => setPayment(prev => ({ ...prev, adminWalletAddress: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none font-mono text-xs"
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tỷ giá chuyển đổi (1 USDT = ? VND)</label>
                    <input
                      type="number"
                      value={payment.usdtToVndRate}
                      onChange={e => setPayment(prev => ({ ...prev, usdtToVndRate: Number(e.target.value) }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none"
                      placeholder="VD: 25000"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="gradient-bg w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      LƯU CẤU HÌNH THANH TOÁN
                    </button>
                  </div>
                </form>
              </div>
              <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
                <div className="flex items-center gap-2 text-violet-400">
                  <Info className="w-5 h-5" />
                  <h4 className="font-bold">Lưu ý nạp tiền</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-4">
                  <li>Tỷ giá được dùng để tự động tính tiền VND khi nạp bằng Crypto.</li>
                  <li>Địa chỉ ví phải là mạng Ethereum (ERC20) để người dùng gửi transaction.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Social Config */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cấu hình Social & Liên hệ</h1>
              <p className="text-slate-400 mt-1">Cập nhật các liên kết mạng xã hội và thông tin liên hệ của bạn.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleSocialSubmit} className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facebook Link</label>
                      <input
                        value={social.facebook}
                        onChange={e => setSocial(prev => ({ ...prev, facebook: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telegram Link</label>
                      <input
                        value={social.telegram}
                        onChange={e => setSocial(prev => ({ ...prev, telegram: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Zalo Link</label>
                      <input
                        value={social.zalo}
                        onChange={e => setSocial(prev => ({ ...prev, zalo: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="https://zalo.me/..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Public Email</label>
                      <input
                        value={social.email}
                        onChange={e => setSocial(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="sonlyhongduc@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="gradient-bg w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      LƯU SOCIAL
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* Contact Config */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Thông tin liên hệ</h1>
              <p className="text-slate-400 mt-1">Thông tin hiển thị tại trang Liên hệ và Footer.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleContactSubmit} className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Địa chỉ</label>
                    <input
                      value={contact.address}
                      onChange={e => setContact(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="VD: 123 Đường ABC, Quận XYZ..."
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số điện thoại</label>
                    <input
                      value={contact.phone}
                      onChange={e => setContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="VD: 090xxxxxxx"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mô tả giới thiệu</label>
                    <textarea
                      value={contact.description}
                      onChange={e => setContact(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 h-32"
                      placeholder="Giới thiệu ngắn về dự án của bạn..."
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="gradient-bg w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      LƯU LIÊN HỆ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
