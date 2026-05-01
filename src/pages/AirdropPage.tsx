import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AirdropPage() {
  const [airdrops, setAirdrops] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'airdrops'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAirdrops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full p-4 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tight"
      >
        <Gift className="w-10 h-10 text-pink-500" />
        Dự án Airdrop
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 text-lg mb-8"
      >
        Tham gia các chương trình Airdrop hấp dẫn để nhận thưởng
      </motion.p>
      
      {airdrops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-[2.5rem] bg-pink-500/10 flex items-center justify-center text-pink-600 mb-8 border border-pink-500/20 shadow-xl shadow-pink-500/5"
          >
            <Gift className="w-12 h-12" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter"
          >
            Sắp ra mắt
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg mb-8"
          >
            Các chương trình Airdrop hấp dẫn đang được chuẩn bị.
          </motion.p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {airdrops.map((airdrop, index) => (
            <motion.div
              key={airdrop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {airdrop.logoUrl ? (
                    <img src={airdrop.logoUrl} alt={airdrop.title} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover:text-pink-500 transition-colors">{airdrop.title}</h3>
                  {airdrop.rewards && (
                    <p className="text-sm font-medium text-pink-500 bg-pink-500/10 px-2 py-1 rounded-lg inline-block">{airdrop.rewards}</p>
                  )}
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {airdrop.description}
              </p>
              
              <a 
                href={airdrop.projectUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 px-4 bg-slate-50 dark:bg-white/5 hover:bg-pink-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 group/btn"
              >
                Tham gia ngay
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
