import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { Project } from '../types';
import { Edit2, Trash2, Plus, ExternalLink, ImageIcon, Layers, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProjects() {
  const navigate = useNavigate();
  const [snapshot, loading] = useCollection(collection(db, 'projects'));
  const projects = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[] | undefined;
  
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredProjects = projects?.filter(p => 
    searchTerm === '' || 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        toast.success('Đã xóa dự án thành công');
      } catch (err) {
        toast.error('Không thể xóa dự án');
      }
    }
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý dự án</h1>
              <p className="text-slate-400 mt-1">Danh sách tất cả các dự án Affiliate của bạn.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm dự án..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm placeholder-slate-500"
                />
              </div>
              <button
                onClick={() => navigate('/admin/projects/new')}
                className="gradient-bg flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all text-sm w-full sm:w-auto whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                THÊM MỚI
              </button>
            </div>
          </div>

          <div className="glass bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Dự án</th>
                    <th className="px-6 py-4">Lĩnh vực</th>
                    <th className="px-6 py-4">Click</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-8 bg-white/5" />
                      </tr>
                    ))
                  ) : filteredProjects?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        Chưa có dự án nào hoặc không tìm thấy.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects?.map((project) => (
                      <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative overflow-hidden">
                              {project.image ? (
                                <img src={project.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200 line-clamp-1 flex items-center gap-1.5">
                                {project.title}
                                {project.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono tracking-tight">{project.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 w-fit">
                            <Layers className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{project.category || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 font-mono">{project.clicks || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => window.open(project.refLink, '_blank')}
                              className="text-slate-400 hover:text-blue-400 p-2"
                              title="Xem Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                              className="text-slate-400 hover:text-violet-400 p-2"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => project.id && handleDelete(project.id)}
                              className="text-slate-400 hover:text-red-400 p-2"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
