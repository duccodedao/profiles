import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, ExternalLink, ArrowLeft, Filter, Sparkles, Loader2 } from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  link: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: '✨' },
  { id: 'chat', label: 'Chatbot', icon: '💬' },
  { id: 'image', label: 'Tạo Ảnh', icon: '🎨' },
  { id: 'video', label: 'Tạo Video', icon: '🎥' },
  { id: 'code', label: 'Lập Trình', icon: '💻' },
  { id: 'design', label: 'Thiết Kế', icon: '✒️' },
  { id: 'audio', label: 'Âm Thanh', icon: '🎵' },
  { id: 'search', label: 'Tìm Kiếm', icon: '🔍' },
];

export default function AIToolsUtility({ onBack }: { onBack: () => void }) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'ai_tools'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AITool));
      setTools(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col w-full h-full p-4 lg:p-8 max-w-7xl mx-auto">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors w-fit font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại Tiện ích
      </button>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Hệ Sinh Thái AI
            <span className="text-xs bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20">
              {tools.length} công cụ
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Khám phá các công cụ Trí tuệ Nhân tạo hàng đầu thế giới</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm công cụ AI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="w-5 h-5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50'
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
          <p className="text-slate-500 animate-pulse">Đang tải biểu dữ liệu AI...</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredTools.map((tool) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={tool.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-1.5 rounded-lg uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center mt-2 mb-4">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-3 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                    <img 
                      src={tool.logo} 
                      alt={tool.name} 
                      loading="lazy"
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=AI' }} 
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 dark:hover:text-white transition-all group/btn"
                  >
                    Truy cập ngay
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTools.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold mb-1">Không tìm thấy công cụ</h3>
              <p className="text-slate-500">Thử một từ khóa khác hoặc dọn dẹp bộ lọc</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
