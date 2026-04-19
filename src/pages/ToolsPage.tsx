import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { QrCode, Building2, Code, Sparkles, Copy, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'bank'>('qr');
  
  // Basic QR State
  const [textToQR, setTextToQR] = useState('');

  // Bank QR State
  const [bankCode, setBankCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');

  const getBankQRLabel = () => {
    if (!bankCode || !bankAccount) return null;
    let url = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact.jpg`;
    const params = new URLSearchParams();
    if (bankAmount) params.append('amount', bankAmount);
    if (bankInfo) params.append('addInfo', bankInfo);
    if (bankName) params.append('accountName', bankName);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return url;
  };

  const bankQRUrl = getBankQRLabel();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 space-y-12">
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mx-auto border border-violet-600/20 mb-6">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Tiện ích thêm</h1>
          <p className="text-slate-400 font-medium">Bộ công cụ trợ giúp nhanh chóng và tiện lợi.</p>
        </section>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-sm mx-auto">
          {(['qr', 'bank'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 flex items-center justify-center gap-2",
                activeTab === tab ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab === 'qr' ? <><Code className="w-4 h-4" /> Mã QR</> : <><Building2 className="w-4 h-4" /> QR Ngân hàng</>}
            </button>
          ))}
        </div>

        <div className="glass-dark border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
           {activeTab === 'qr' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic mb-2">Tạo mã QR Cơ bản</h2>
                    <p className="text-slate-400 text-sm">Chuyển đổi văn bản, đường dẫn thành mã QR nhanh chóng.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Văn bản / Link</label>
                    <textarea 
                      value={textToQR}
                      onChange={(e) => setTextToQR(e.target.value)}
                      placeholder="Nhập nội dung cần tạo mã QR..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-white/5 rounded-3xl border border-white/5">
                  <div className="bg-white p-4 rounded-3xl w-full max-w-[240px] aspect-square flex items-center justify-center">
                    {textToQR ? (
                      <QRCodeSVG value={textToQR} size={200} className="w-full h-full" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center gap-2">
                        <QrCode className="w-10 h-10" />
                        <span className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu</span>
                      </div>
                    )}
                  </div>
                  {textToQR && (
                     <p className="text-xs text-slate-500 uppercase font-bold tracking-widest text-center px-4">Sử dụng điện thoại để quét</p>
                  )}
                </div>
             </motion.div>
           )}

           {activeTab === 'bank' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
               <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic mb-2">Tạo mã QR Ngân Hàng</h2>
                    <p className="text-slate-400 text-sm">Tạo mã VietQR nhận tiền nhanh qua các ứng dụng ngân hàng.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Mã ngân hàng</label>
                        <input value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="VD: VCB, MB, ABBANK" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white uppercase text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Số tài khoản</label>
                        <input value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="VD: 1903..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tên tài khoản (Không bắt buộc)</label>
                      <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="VD: NGUYEN VAN A" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white uppercase text-sm" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Số tiền (Không bắt buộc)</label>
                      <input type="number" value={bankAmount} onChange={e => setBankAmount(e.target.value)} placeholder="VD: 50000" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nội dung (Không bắt buộc)</label>
                      <input value={bankInfo} onChange={e => setBankInfo(e.target.value)} placeholder="Nội dung chuyển khoản" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm" />
                    </div>
                  </div>
               </div>

               <div className="flex flex-col items-center justify-center space-y-6 pt-4 md:pt-0">
                  <div className="bg-white p-4 rounded-3xl w-full max-w-[280px] min-h-[280px] flex items-center justify-center">
                    {bankQRUrl ? (
                      <img src={bankQRUrl} alt="VietQR" className="w-full h-auto rounded-xl" />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center gap-2">
                        <QrCode className="w-10 h-10" />
                        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">Nhập thông tin<br/>để tạo mã</span>
                      </div>
                    )}
                  </div>
                  {bankQRUrl && (
                     <div className="flex gap-2 w-full max-w-[280px]">
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(bankQRUrl);
                          toast.success('Đã copy đường dẫn ảnh!');
                        }}
                        className="flex-1 bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10 text-white px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                       >
                         <Copy className="w-4 h-4" /> COPY LINK
                       </button>
                     </div>
                  )}
               </div>
             </motion.div>
           )}
        </div>

        <div className="mt-12 opacity-50 px-4">
          <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto p-6 rounded-3xl border border-white/10 border-dashed">
             <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
             <p className="text-sm font-bold uppercase tracking-widest text-center">Sắp ra mắt nhiều tính năng hay ho...</p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
