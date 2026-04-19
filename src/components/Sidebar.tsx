import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  Info, 
  MessageSquare, 
  ChevronDown, 
  Rocket,
  Wrench,
  ChevronRight,
  LayoutDashboard,
  User,
  Share2,
  Settings,
  ListTodo,
  Wallet,
  History,
  ShoppingBag,
  PiggyBank,
  Link as LinkIcon,
  Briefcase,
  Users,
  CheckSquare,
  Banknote,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection } from 'firebase/firestore';
import { db, auth, ADMIN_EMAIL } from '../lib/firebase';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const location = useLocation();

  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const menuGroups = [
    {
      title: 'Khám phá',
      items: [
        { label: 'Trang chủ', icon: Home, path: '/' },
        { label: 'Tiện ích', icon: Wrench, path: '/tools' },
        { label: 'Cửa hàng', icon: ShoppingBag, path: '/store', isComingSoon: true },
      ]
    },
    {
      title: 'Tài chính',
      items: [
        { label: 'Nhiệm vụ', icon: ListTodo, path: '/tasks' },
        { label: 'Rút tiền', icon: Wallet, path: '/withdraw' },
        { label: 'Nạp tiền', icon: PiggyBank, path: '/deposit' },
        { label: 'Kết nối ví', icon: LinkIcon, path: '/connect-wallet' },
        { label: 'Lịch sử giao dịch', icon: History, path: '/transactions' },
      ]
    },
    {
      title: 'Quản lý cá nhân',
      items: [
        { label: 'Tài khoản', icon: User, path: '/account' },
        { label: 'Cài đặt', icon: Settings, path: '/settings' },
        { label: 'Giới thiệu', icon: Share2, path: '/referral' },
      ]
    },
    {
      title: 'Thông tin',
      items: [
        { label: 'Về chúng tôi', icon: Info, path: '/about' },
        { label: 'Liên hệ', icon: MessageSquare, path: '/contact' },
      ]
    }
  ];

  const adminItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Dự án', icon: Briefcase, path: '/admin/projects' },
    { label: 'Người dùng', icon: Users, path: '/admin/users' },
    { label: 'Thanh toán', icon: Banknote, path: '/admin/withdrawals' },
    { label: 'Cấu hình', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="w-full space-y-5">
      
      {menuGroups.map((group, idx) => (
        <div key={idx} className="space-y-1">
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5 opacity-50">{group.title}</p>
          {group.items.map((item: any) => (
            item.isComingSoon ? (
              <div
                key={item.path}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl opacity-60 cursor-not-allowed text-slate-500 select-none group"
                title="Sắp ra mắt"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4.5 h-4.5 text-slate-600 transition-transform" />
                  <span className="font-bold text-xs tracking-tight">{item.label}</span>
                </div>
                <span className="text-[7px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-500/60 px-1.5 py-0.5 rounded border border-violet-500/20">
                  Soon
                </span>
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group hover:bg-white/5",
                  isActive ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5" : "text-slate-400"
                )}
              >
                <item.icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs tracking-tight">{item.label}</span>
              </NavLink>
            )
          ))}
        </div>
      ))}
      
      {isAdmin && (
        <div className="space-y-1 pt-2 border-t border-white/5">
          <p className="px-4 text-[9px] font-black text-violet-500/50 uppercase tracking-[0.2em] mb-1.5">Quản lý</p>
          <NavLink
            to="/admin"
            onClick={handleNavClick}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group hover:bg-white/5",
              isActive ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5" : "text-slate-400"
            )}
          >
            <LayoutDashboard className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            <span className="font-black text-xs tracking-tight text-violet-400 uppercase italic">Admin Panel</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
