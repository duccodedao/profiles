import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Newspaper, FileText, Settings, 
  Box, Gift, Landmark, LineChart, Gamepad2, 
  Wrench, Grid, Users, ShieldCheck, Zap, Activity, 
  ChevronRight, Sparkles, Globe, Terminal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export default function Home() {
  const navigate = useNavigate();
  const { userData, isAdmin } = useAuthStore();
  const { isOnline } = useAppStore();

  const stats = [
    { label: 'Uptime', value: '99.9%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Security', value: 'Level 5', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Latency', value: '24ms', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active', value: 'Global', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const modules = [
    { 
      title: 'Thị trường', 
      desc: 'Theo dõi giá vàng, ngoại tệ realtime', 
      icon: TrendingUp, 
      path: '/market', 
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      tag: 'HOT',
      colSpan: 'md:col-span-2 lg:col-span-2'
    },
    { 
      title: 'Tin tức', 
      desc: 'Cập nhật tin tức 24/7', 
      icon: Newspaper, 
      path: '/news', 
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
      title: 'Sản phẩm', 
      desc: 'Cửa hàng trực tuyến', 
      icon: Box, 
      path: '/products', 
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
      title: 'Airdrop', 
      desc: 'Danh sách dự án Airdrop', 
      icon: Gift, 
      path: '/airdrop', 
      color: 'bg-pink-500',
      textColor: 'text-pink-500',
      tag: 'NEW',
      colSpan: 'md:col-span-2 lg:col-span-1'
    },
    { 
      title: 'Ngân hàng', 
      desc: 'Mở thẻ ưu đãi', 
      icon: Landmark, 
      path: '/banks', 
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
      title: 'Sàn giao dịch', 
      desc: 'Đăng ký nhận hoa hồng', 
      icon: LineChart, 
      path: '/exchanges', 
      color: 'bg-teal-500',
      textColor: 'text-teal-500',
      colSpan: 'md:col-span-1 lg:col-span-2'
    },
    { 
      title: 'Chia sẻ File', 
      desc: 'Tài nguyên cộng đồng', 
      icon: FileText, 
      path: '/files', 
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
      title: 'Tiện ích', 
      desc: 'Công cụ đa năng', 
      icon: Grid, 
      path: '/utilities', 
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
      title: 'Game', 
      desc: 'Giải trí', 
      icon: Gamepad2, 
      path: '/games', 
      color: 'bg-violet-500',
      textColor: 'text-violet-500',
      colSpan: 'md:col-span-1 lg:col-span-1'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 p-4 lg:p-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500 blur-[120px] rounded-full rotate-45 transform" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[120%] bg-purple-500 blur-[100px] rounded-full rotate-12 transform" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" /> Hệ sinh thái đa năng
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]"
            >
              Chào mừng, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {userData?.displayName?.split(' ')[0] || 'Member'}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 font-medium text-lg leading-relaxed max-w-lg"
            >
              Khám phá không gian làm việc số với đầy đủ công cụ từ theo dõi thị trường tài chính, đến các công cụ tiện ích hàng ngày.
            </motion.p>
            <div className="flex flex-wrap gap-4 pt-2">
               <button 
                onClick={() => navigate('/market')}
                className="px-6 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
               >
                  <TrendingUp className="w-4 h-4" /> Khám phá ngay
               </button>
               {isAdmin && (
                 <button 
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                 >
                    <Settings className="w-4 h-4" /> Quản trị Admin
                 </button>
               )}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
             {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col items-start gap-3"
                >
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-3"
          >
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-blue-500" /> Tổng quan
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((mod, i) => (
            <motion.button
              key={i}
              onClick={() => navigate(mod.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`group relative ${mod.colSpan} bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl text-left hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between min-h-[160px]`}
            >
              <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-500 pointer-events-none">
                 <mod.icon className="w-48 h-48" />
              </div>
              
              <div className="flex items-start justify-between relative z-10 w-full mb-4">
                <div className={`w-12 h-12 rounded-2xl ${mod.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <mod.icon className="w-6 h-6" />
                </div>
                {mod.tag && (
                  <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black px-2 py-1 rounded-lg">
                    {mod.tag}
                  </span>
                )}
              </div>
              
              <div className="relative z-10 w-full">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-blue-500 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                  {mod.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
