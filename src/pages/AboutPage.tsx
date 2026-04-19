import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Info, Target, Users, Shield } from 'lucide-react';

export default function AboutPage() {
  const [contact, setContact] = useState<any>(null);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'contact')).then(snap => {
      if (snap.exists()) setContact(snap.data());
    });
  }, []);

  const stats = [
    { label: 'Dự án', value: '100+', icon: Target },
    { label: 'Thành viên', value: '10K+', icon: Users },
    { label: 'Uy tín', value: '100%', icon: Shield },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 py-10">
        <section className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 gradient-bg rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-violet-500/20"
          >
            <Info className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic">BMASS HUB</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Nền tảng kết nối các cơ hội Affiliate tiềm năng, minh bạch và hiệu quả nhất.
          </p>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl border border-white/5 text-center space-y-1"
            >
              <stat.icon className="w-5 h-5 mx-auto text-violet-400 mb-1" />
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <section className="glass-dark p-8 md:p-10 rounded-[32px] border border-white/5 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sứ mệnh</h2>
          <div className="space-y-4 text-slate-400 leading-relaxed text-base font-medium">
            <p>
              {contact?.description || "Chúng tôi cam kết mang đến những cơ hội kiếm tiền Affiliate minh bạch, hiệu quả và bền vững nhất cho cộng đồng."}
            </p>
            <p>
              Bmass không ngừng chọn lọc những công cụ và dự án tốt nhất để giúp bạn xây dựng nguồn thu nhập thụ động bền vững.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
