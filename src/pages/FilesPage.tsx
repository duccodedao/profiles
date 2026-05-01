import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Share2, Download, Search, X, Loader2, File, FileArchive, Trash2, Edit2, ImageIcon, FileCode, CheckCircle2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { toSafeDate } from '../lib/utils';

interface SharedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaderName: string;
  createdAt: any;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'archive', label: 'Nén (ZIP, RAR)' },
  { id: 'document', label: 'Tài liệu (PDF, DOC)' },
  { id: 'image', label: 'Hình ảnh' },
  { id: 'code', label: 'Mã nguồn' },
];

export default function FilesPage() {
  const { userData, isAdmin } = useAuthStore();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileId = params.get('id');
    if (fileId) {
      setHighlightedId(fileId);
      setTimeout(() => setHighlightedId(null), 10000);
      setTimeout(() => {
        const element = document.getElementById(fileId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'sharedFiles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedFile)));
    });
    return () => unsub();
  }, []);

  const handleDelete = async (file: SharedFile) => {
    if (!isAdmin) return;
    if (!confirm('Bạn chắc chắn muốn xóa file này?')) return;
    try {
      await deleteDoc(doc(db, 'sharedFiles', file.id));
      toast.success('Đã xóa file!');
    } catch (err) {
      toast.error('Lỗi khi xóa file.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    const githubDoc = await getDoc(doc(db, 'settings', 'github'));
    if (!githubDoc.exists()) {
      return toast.error('Vui lòng cấu hình GitHub trong Admin Panel trước.');
    }
    const config = githubDoc.data();
    if (!config.token || !config.repo || !config.username) {
      return toast.error('Cấu hình GitHub không đầy đủ.');
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        const fileName = `${Date.now()}_${file.name}`;
        const path = `files/${fileName}`;
        
        const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Upload shared file: ${file.name}`,
            content: base64Content,
          }),
        });

        if (!response.ok) throw new Error('Upload to GitHub failed');
        const data = await response.json();
        const downloadUrl = data.content.download_url;

        await addDoc(collection(db, 'sharedFiles'), {
          name: file.name,
          url: downloadUrl,
          type: file.name.split('.').pop() || 'unknown',
          size: file.size,
          uploaderName: userData?.displayName || 'Admin',
          createdAt: serverTimestamp(),
        });

        toast.success('Đã chia sẻ file thành công!');
        setShowUploadModal(false);
      };
    } catch (err) {
      toast.error('Lỗi khi tải file lên.');
    } finally {
      setIsUploading(false);
    }
  };

  const shareLink = (file: SharedFile) => {
    const url = `${window.location.origin}/files?id=${file.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép link chia sẻ!');
  };

  const getCategoryFromType = (type: string) => {
    const t = type.toLowerCase();
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(t)) return 'archive';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(t)) return 'document';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(t)) return 'image';
    if (['js', 'ts', 'html', 'css', 'json', 'py', 'tsx', 'jsx'].includes(t)) return 'code';
    return 'other';
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'all' || getCategoryFromType(f.type) === activeCategory;
    return matchesSearch && matchesCat;
  });

  const getFileStyle = (type: string) => {
    const cat = getCategoryFromType(type);
    switch (cat) {
      case 'archive': return { icon: <FileArchive className="w-8 h-8 text-orange-500" />, bg: 'bg-orange-500/10', color: 'text-orange-600 border-orange-500/20 bg-orange-500/10' };
      case 'document': return { icon: <FileText className="w-8 h-8 text-blue-500" />, bg: 'bg-blue-500/10', color: 'text-blue-600 border-blue-500/20 bg-blue-500/10' };
      case 'image': return { icon: <ImageIcon className="w-8 h-8 text-emerald-500" />, bg: 'bg-emerald-500/10', color: 'text-emerald-600 border-emerald-500/20 bg-emerald-500/10' };
      case 'code': return { icon: <FileCode className="w-8 h-8 text-purple-500" />, bg: 'bg-purple-500/10', color: 'text-purple-600 border-purple-500/20 bg-purple-500/10' };
      default: return { icon: <File className="w-8 h-8 text-slate-500" />, bg: 'bg-slate-500/10', color: 'text-slate-600 border-slate-500/20 bg-slate-500/10' };
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 lg:p-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[150%] bg-blue-500 blur-[100px] rounded-full rotate-45 transform" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Kho Lưu Trữ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Tài Liệu Số</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed">
              Truy cập, chia sẻ và tải xuống tài liệu, phần mềm, mã nguồn và tệp đính kèm nội bộ một cách nhanh chóng và an toàn.
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 shrink-0"
            >
              <Upload className="w-5 h-5" /> Tải Lên Mới
            </button>
          )}
        </div>
      </section>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 overflow-x-auto w-full lg:w-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* File Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file, idx) => {
            const style = getFileStyle(file.type);
            return (
              <motion.div
                id={file.id}
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative bg-white dark:bg-slate-900/50 border rounded-3xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden ${
                  file.id === highlightedId ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none ${style.bg}`} />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${style.bg}`}>
                    {style.icon}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <button 
                        onClick={async () => {
                          const newName = prompt('Nhập tên file mới:', file.name);
                          if (newName && newName !== file.name) {
                            try {
                              await updateDoc(doc(db, 'sharedFiles', file.id), { name: newName });
                              toast.success('Đã đổi tên file!');
                            } catch (err) {
                              toast.error('Lỗi khi đổi tên file.');
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(file)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => shareLink(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white text-base max-w-[90%] line-clamp-2 leading-tight mb-2 relative z-10 group-hover:text-blue-600 transition-colors">
                  {file.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${style.color}`}>
                     {file.type}
                   </span>
                   <span className="text-[11px] font-medium text-slate-500">
                     {formatSize(file.size)}
                   </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px]">
                      {file.uploaderName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[80px]">{file.uploaderName}</span>
                  </div>
                  
                  <a 
                    href={file.url} 
                    download 
                    target="_blank"
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem]">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không tìm thấy tài liệu</h3>
          <p className="text-slate-500 text-sm">Hãy thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm.</p>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tải Lên Máy Chủ</h2>
                <p className="text-sm text-slate-500 mt-2">Hỗ trợ các định dạng PDF, DOC, ZIP, RAR, JPG, PNG...</p>
              </div>

              <div className="space-y-6">
                <label className="block group cursor-pointer">
                  <div className="w-full h-48 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group-hover:border-blue-500 group-hover:bg-blue-500/5">
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Nhấn để Chọn File</span>
                        <span className="text-[10px] text-slate-400 font-medium">Tối đa 25MB mỗi file</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                </label>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-start gap-4 border border-slate-100 dark:border-white/5">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                     Hệ thống lưu trữ trên GitHub. Các file khi chia sẻ sẽ có thể truy cập bằng đường link public do GitHub phân phối. Hãy cẩn trọng với các tài liệu nội bộ.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
