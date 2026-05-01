import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center z-50">
      <motion.img 
        src="https://tytpht.hdd.io.vn/img/bmassloadings.png" 
        alt="Logo" 
        className="w-24 h-24 mb-8"
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
    </div>
  );
}
