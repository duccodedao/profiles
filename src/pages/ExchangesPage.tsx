import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LineChart, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'exchanges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExchanges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full h-full p-4 lg:p-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3"
      >
        <LineChart className="w-10 h-10 text-emerald-500" />
        Sàn giao dịch đối tác
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 text-lg mb-8"
      >
        Các sàn giao dịch uy tín kèm theo các quyền lợi khi đăng ký mới
      </motion.p>
      
      {exchanges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem]">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-6">
            <LineChart className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đang cập nhật</h2>
          <p className="text-slate-500">Các sàn giao dịch đối tác sẽ sớm có mặt tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exchanges.map((exchange, index) => (
            <motion.div
              key={exchange.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {exchange.logoUrl ? (
                    <img src={exchange.logoUrl} alt={exchange.title} className="w-full h-full object-cover" />
                  ) : (
                    <LineChart className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover:text-emerald-500 transition-colors">{exchange.title}</h3>
                  <p className="text-sm font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg inline-block">{exchange.benefits || 'Chiết khấu phí giao dịch'}</p>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {exchange.description}
              </p>
              
              <a 
                href={exchange.affiliateUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 px-4 bg-slate-50 dark:bg-white/5 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 group/btn"
              >
                Đăng ký tài khoản ngay
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
