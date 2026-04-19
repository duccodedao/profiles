import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { MessageSquare, Mail, Phone, MapPin, Send, Facebook, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [contact, setContact] = useState<any>(null);
  const [social, setSocial] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'contact')).then(snap => {
      if (snap.exists()) setContact(snap.data());
    });
    getDoc(doc(db, 'settings', 'social')).then(snap => {
      if (snap.exists()) setSocial(snap.data());
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Cảm ơn bạn! Thông tin đã được gửi đi.');
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Liên hệ</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Hỗ trợ 24/7. Hãy gửi lời nhắn nếu bạn cần bất kỳ sự hỗ trợ nào.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                <p className="text-white font-medium">{social?.email || "sonlyhongduc@gmail.com"}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Điện thoại</p>
                <p className="text-white font-medium">{contact?.phone || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5 flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Địa chỉ</p>
                <p className="text-white font-medium">{contact?.address || "Chưa cập nhật"}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social?.telegram && (
                <a href={social.telegram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Send className="w-5 h-5" />
                </a>
              )}
              {social?.zalo && (
                <a href={social.zalo} target="_blank" rel="noopener noreferrer" className="w-12 h-12 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold">
                  Zalo
                </a>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-dark p-8 md:p-10 rounded-[40px] border border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Họ và tên</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email liên hệ</label>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="example@gmail.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chủ đề hỗ trợ</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="VD: Hợp tác, Lỗi hệ thống..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nội dung chi tiết</label>
                <textarea required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[150px]" placeholder="Nhập nội dung bạn muốn gửi..." />
              </div>

              <button
                disabled={isSubmitting}
                className="w-full gradient-bg py-5 rounded-2xl font-bold text-white shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Send className="w-5 h-5 animate-bounce" /> : <Send className="w-5 h-5" />}
                GỬI LỜI NHẮN NGAY
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
