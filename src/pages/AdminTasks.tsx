import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { Plus, Trash2, Loader2, ListTodo, Edit2, Save, X, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function AdminTasks() {
  const [snapshot, loading] = useCollection(collection(db, 'tasks'));
  const tasks = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[] | undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTasks = tasks?.filter(t => 
    searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    reward: 0,
    steps: [''],
    image: '',
    status: 'active'
  });

  const handleSave = async (e: React.FormEvent) => {
    // ...
    e.preventDefault();
    if (!currentTask.title || !currentTask.reward) return;

    try {
      const taskData = {
        ...currentTask,
        createdAt: currentTask.id ? undefined : serverTimestamp(),
      };
      
      if (currentTask.id) {
        await updateDoc(doc(db, 'tasks', currentTask.id), taskData);
        toast.success('Đã cập nhật nhiệm vụ');
      } else {
        const newRef = doc(collection(db, 'tasks'));
        await setDoc(newRef, { ...taskData, id: newRef.id, createdAt: serverTimestamp() });
        toast.success('Đã thêm nhiệm vụ mới');
      }
      setIsEditing(false);
      resetForm();
    } catch (err) {
      toast.error('Lỗi khi lưu nhiệm vụ');
    }
  };

  const resetForm = () => {
    setCurrentTask({
      title: '',
      description: '',
      reward: 0,
      steps: [''],
      status: 'active'
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xoá nhiệm vụ này?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      toast.success('Đã xoá nhiệm vụ');
    } catch (err) {
      toast.error('Lỗi khi xoá nhiệm vụ');
    }
  };

  const addStep = () => {
    setCurrentTask(prev => ({ ...prev, steps: [...(prev.steps || []), ''] }));
  };

  const removeStep = (index: number) => {
    setCurrentTask(prev => ({ ...prev, steps: (prev.steps || []).filter((_, i) => i !== index) }));
  };

  return (
    <Layout>
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý nhiệm vụ</h1>
              <p className="text-slate-400 mt-1">Thiết lập các nhiệm vụ kiếm tiền cho người dùng.</p>
            </div>
            {!isEditing && (
              <div className="flex w-full sm:w-auto items-center gap-4">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm nhiệm vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white text-sm placeholder-slate-500"
                  />
                </div>
                <button
                  onClick={() => { setIsEditing(true); resetForm(); }}
                  className="gradient-bg px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  TẠO MỚI
                </button>
              </div>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleSave} className="glass-dark p-8 rounded-3xl border border-violet-500/20 space-y-6 animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tên nhiệm vụ</label>
                  <input
                    required
                    value={currentTask.title}
                    onChange={e => setCurrentTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="VD: Mở tài khoản ngân hàng VCB"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Phần thưởng (VND)</label>
                  <input
                    required
                    type="number"
                    value={currentTask.reward}
                    onChange={e => setCurrentTask(prev => ({ ...prev, reward: Number(e.target.value) }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="VD: 50000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ảnh đại diện (URL)</label>
                <input
                  value={currentTask.image}
                  onChange={e => setCurrentTask(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mô tả</label>
                <textarea
                  required
                  value={currentTask.description}
                  onChange={e => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 h-24"
                  placeholder="Mô tả quyền lợi và yêu cầu..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Các bước thực hiện</label>
                {currentTask.steps?.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 font-bold text-violet-400">
                      {idx + 1}
                    </div>
                    <input
                      required
                      value={step}
                      onChange={e => {
                        const newSteps = [...(currentTask.steps || [])];
                        newSteps[idx] = e.target.value;
                        setCurrentTask(prev => ({ ...prev, steps: newSteps }));
                      }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none"
                      placeholder={`Bước ${idx + 1}...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase"
                >
                  + THÊM BƯỚC THỰC HIỆN
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="gradient-bg px-8 py-3 rounded-xl font-bold text-white shadow-xl shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {currentTask.id ? 'CẬP NHẬT' : 'XÁC NHẬN TẠO'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
            ) : filteredTasks?.length === 0 ? (
              <div className="glass p-10 rounded-3xl text-center text-slate-500 italic border border-white/5">
                Chưa có nhiệm vụ nào được tạo hoặc tìm thấy.
              </div>
            ) : (
              filteredTasks?.map((task) => (
                <div key={task.id} className="glass-dark p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-violet-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all overflow-hidden",
                      task.status === 'active' ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                    )}>
                      {task.image ? (
                        <img src={task.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <ListTodo className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-200">{task.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-emerald-400 font-bold text-sm">+{(task.reward || 0).toLocaleString()}đ</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{task.steps?.length || 0} Bước</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          task.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {task.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setCurrentTask(task);
                        setIsEditing(true);
                      }}
                      className="p-3 bg-white/5 hover:bg-violet-500/20 rounded-xl text-slate-400 hover:text-violet-400 transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => task.id && handleDelete(task.id)}
                      className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all"
                      title="Xoá"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </Layout>
  );
}
