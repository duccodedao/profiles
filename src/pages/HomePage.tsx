import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import { Search, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const projectsRef = collection(db, 'projects');
  
  const q = query(projectsRef, orderBy('createdAt', 'desc'));

  const [snapshot, loading, error] = useCollection(q);
  const projects = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[] | undefined;

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 pt-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
              🔥 Bmass Hub v2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase italic">
              Kiếm Tiền Online <br />
              <span className="gradient-text">An Toàn & Uy Tín</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              Trung tâm tổng hợp các dự án Affiliate sàn lọc kỹ lưỡng. <br className="hidden md:block" />
              Gia tăng thu nhập thụ động cùng cộng đồng Bmass.
            </p>
          </div>

          {/* Intro Stats/Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Dự án', value: '500+' },
              { label: 'Cập nhật', value: 'Hàng ngày' },
              { label: 'Hoa hồng', value: 'Hấp dẫn' },
            ].map((stat, i) => (
              <div key={i} className="glass-dark border border-white/5 p-4 rounded-2xl">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm dự án, lĩnh vực hoặc mã ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass bg-white/5 border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white placeholder-slate-500 font-medium"
              />
            </div>
          </div>
        </section>

        {/* Introduction / How it works */}
        {searchTerm === '' && (
          <section className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
              {[
                { step: '01', title: 'Chọn dự án', desc: 'Duyệt các dự án từ Tài chính đến Crypto.' },
                { step: '02', title: 'Lấy mã giới thiệu', desc: 'Copy link hoặc mã Ref để tham gia.' },
                { step: '03', title: 'Tạo thu nhập', desc: 'Tối ưu hóa nguồn thu từ hệ thống.' },
              ].map((item, i) => (
                <div key={i} className="glass-dark p-6 rounded-3xl border border-white/5 space-y-3 relative overflow-hidden group hover:border-violet-500/30 transition-all">
                  <div className="text-4xl font-black text-white/5 absolute -right-2 -top-2 group-hover:text-violet-500/10 transition-colors">{item.step}</div>
                  <h3 className="text-lg font-bold text-white relative z-10">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Grid Header */}
        <div className="flex items-center justify-between border-l-4 border-violet-500 pl-4">
          <h2 className="text-2xl font-black tracking-tighter uppercase">
            Tất cả dự án
          </h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {filteredProjects?.length || 0} Kết quả
          </span>
        </div>

        {/* Projects Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-dark rounded-2xl h-[450px] animate-pulse bg-white/5" />
            ))
          ) : error ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-red-400">Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
          ) : filteredProjects?.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              Không tìm thấy dự án nào khớp với từ khóa "{searchTerm}"
            </div>
          ) : (
            filteredProjects?.map((project, idx) => (
              <div key={project.id || idx}>
                <ProjectCard project={project} />
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}
