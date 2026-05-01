import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 mb-6 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl"
      >
        <Sparkles className="w-12 h-12 text-primary-500" />
      </motion.div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
        Tính năng này đang được chúng tôi phát triển và sẽ sớm ra mắt trong thời gian tới. Mong bạn thông cảm!
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition border border-white/10 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay về trang trước
      </button>
    </div>
  );
}
