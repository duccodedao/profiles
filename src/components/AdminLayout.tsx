import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Settings, 
  ChevronRight, 
  BarChart3,
  PlusCircle,
  Layers,
  Users,
  CheckSquare,
  Banknote,
  ListTodo,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin', end: true },
    { label: 'Dự án', icon: Briefcase, path: '/admin/projects' },
    { label: 'Thêm mới', icon: PlusCircle, path: '/admin/projects/new' },
    { label: 'Người dùng', icon: Users, path: '/admin/users' },
    { label: 'Nhiệm vụ', icon: ListTodo, path: '/admin/tasks' },
    { label: 'Phê duyệt', icon: CheckSquare, path: '/admin/submissions' },
    { label: 'Thanh toán', icon: Banknote, path: '/admin/withdrawals' },
    { label: 'Cấu hình chung', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 md:-mx-8 -my-4 md:-my-8 min-h-[calc(100vh-65px)]">
      {/* Secondary Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 p-6 space-y-2 shrink-0 overflow-y-auto lg:sticky lg:top-[65px] h-fit lg:h-[calc(100vh-65px)] border-l border-white/10 hidden lg:block">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">Hệ thống</p>
          </div>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Admin Console</h2>
        </div>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group border",
              isActive 
                ? "bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-lg shadow-violet-500/5 font-bold" 
                : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-violet-400" : "text-slate-500")} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </div>
                <ChevronRight className={cn("w-3 h-3 transition-all", isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
              </>
            )}
          </NavLink>
        ))}
      </aside>

      {/* Content Area */}
      <div className="flex-1 min-w-0 p-4 md:p-8 xl:p-10">
        <div className="glass-dark rounded-[40px] p-6 md:p-10 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-950/40 relative overflow-hidden">
          {/* Subtle background glow for admin area */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
