import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, GithubConfig, Category } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';
import { ImageIcon, Loader2, Save, ArrowLeft, Upload, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AdminProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    image: '',
    refLink: '',
    refCode: '',
    slug: '',
    isVerified: false,
  });

  const [githubConfig, setGithubConfig] = useState<GithubConfig | null>(null);

  useEffect(() => {
    const fetchGithub = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'github'));
      if (docSnap.exists()) {
        setGithubConfig(docSnap.data() as GithubConfig);
      }
    };
    fetchGithub();

    if (isEdit) {
      const fetchProject = async () => {
        const docSnap = await getDoc(doc(db, 'projects', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title || '',
            description: data.description || '',
            image: data.image || '',
            refLink: data.refLink || '',
            refCode: data.refCode || '',
            slug: data.slug || '',
            isVerified: data.isVerified || false,
          });
        }
        setFetching(false);
      };
      fetchProject();
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !githubConfig) return;

    if (!githubConfig.accessToken) {
      toast.error('Vui lòng cấu hình GitHub Token trước khi upload.');
      return;
    }

    setUploading(true);
    toast.loading('Đang tải ảnh lên GitHub...');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        const response = await axios.post('/api/github/upload', {
          config: githubConfig,
          fileData: base64,
          fileName
        });

        setFormData(prev => ({ ...prev, image: response.data.url }));
        toast.dismiss(); // Clear loading toast
        toast.success('Upload ảnh thành công!');
        setUploading(false);
      };
    } catch (err) {
      console.error('Upload error:', err);
      toast.dismiss();
      toast.error('Upload ảnh thất bại.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectsRef = collection(db, 'projects');
      if (isEdit) {
        await updateDoc(doc(db, 'projects', id), {
          ...formData,
          updatedAt: Timestamp.now()
        });
      } else {
        const newDocRef = doc(projectsRef);
        await setDoc(newDocRef, {
          id: newDocRef.id,
          ...formData,
          createdAt: Timestamp.now(),
          clicks: 0
        });
      }
      toast.success(isEdit ? 'Đã cập nhật dự án!' : 'Đã tạo dự án mới!');
      navigate('/admin/projects');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Có lỗi xảy ra khi lưu dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></Layout>;

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Sửa dự án' : 'Thêm dự án mới'}</h1>
              <p className="text-slate-400 mt-1">Cập nhật thông tin dự án Affiliate của bạn.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Info */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Tên dự án</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="VD: Kiếm tiền với App X"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Slug (URL)</label>
                  <input
                    required
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
                    placeholder="kiem-tien-app-x"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Mô tả ngắn</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Giới thiệu về dự án..."
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={formData.isVerified}
                      onChange={e => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                    />
                    <div className="w-10 h-6 bg-white/10 rounded-full border border-white/10 peer-checked:bg-violet-600 peer-checked:border-violet-500 transition-all" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">ĐÃ XÁC MINH <CheckCircle2 className="inline-block w-4 h-4 ml-1 text-emerald-500" /></span>
                </label>
              </div>

              {/* Right Column: Links & Image */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Link Affiliate</label>
                  <input
                    required
                    value={formData.refLink}
                    onChange={e => setFormData(prev => ({ ...prev, refLink: e.target.value }))}
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="https://app.com/ref=123"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Mã giới thiệu (Nếu có)</label>
                  <input
                    value={formData.refCode}
                    onChange={e => setFormData(prev => ({ ...prev, refCode: e.target.value }))}
                    className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="123456"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Ảnh đại diện (Banner)</label>
                  <div className="space-y-3">
                    <div className="relative aspect-video glass bg-white/5 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center group">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, image: '' }))}
                            className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-6 text-slate-500">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">Dán link ảnh hoặc upload</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-violet-500 w-10 h-10" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        className="flex-1 glass bg-white/5 border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none"
                        value={formData.image}
                        onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Link ảnh (https://...)"
                      />
                      <label className="bg-white/10 hover:bg-white/20 p-2 rounded-xl cursor-pointer transition-colors border border-white/10 flex items-center gap-2 px-4 shadow-lg group">
                        <Upload className="w-4 h-4 text-white group-hover:scale-110" />
                        <span className="text-xs font-bold whitespace-nowrap">UPLOAD</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className="gradient-bg px-12 py-3.5 rounded-xl font-bold text-white shadow-xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {isEdit ? 'LƯU THAY ĐỔI' : 'TẠO DỰ ÁN'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </Layout>
  );
}
