import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Upload, Trash2, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmStore } from '../../store/confirmStore';

export default function AdminAITools() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { openConfirm } = useConfirmStore();

  useEffect(() => {
    const q = query(collection(db, 'ai_tools'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTools(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.ai_tools && Array.isArray(json.ai_tools)) {
          toast.loading('Đang import dữ liệu...', { id: 'import' });
          let count = 0;
          for (const item of json.ai_tools) {
            const id = item.id || Date.now().toString() + Math.random().toString(36).substring(7);
            await setDoc(doc(db, 'ai_tools', id), {
              ...item,
              id,
              createdAt: Date.now()
            });
            count++;
          }
          toast.success(`Đã import thành công ${count} mục`, { id: 'import' });
        } else {
          toast.error('File JSON không đúng định dạng (cần có mảng ai_tools)');
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'Xóa công cụ AI',
      message: 'Bạn có chắc chắn muốn xóa công cụ này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'ai_tools', id));
          toast.success('Đã xóa thành công');
        } catch (error) {
          toast.error('Lỗi khi xóa');
        }
      }
    });
  };

  const deleteAll = () => {
    openConfirm({
      title: 'Xóa tất cả dữ liệu',
      message: 'Bạn có chắc chắn muốn xóa TẤT CẢ công cụ AI không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          toast.loading('Đang xóa...', { id: 'delete' });
          for (const tool of tools) {
            await deleteDoc(doc(db, 'ai_tools', tool.id));
          }
          toast.success('Đã xóa tất cả dữ liệu', { id: 'delete' });
        } catch (error) {
          toast.error('Lỗi khi xóa', { id: 'delete' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold">Công Cụ AI</h2>
          <p className="text-sm text-slate-500">Quản lý danh sách các công cụ AI</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
          <button
            onClick={deleteAll}
            disabled={tools.length === 0}
            className="flex items-center gap-2 bg-red-100 text-red-600 dark:bg-red-500/10 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-500/20 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <div key={tool.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-3 relative group">
            <button
              onClick={() => handleDelete(tool.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <img src={tool.logo || 'https://via.placeholder.com/150'} alt={tool.name} className="w-16 h-16 object-contain rounded-xl" />
            <div>
              <h3 className="font-bold text-lg">{tool.name}</h3>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">{tool.category}</span>
            </div>
          </div>
        ))}
        {tools.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Chưa có dữ liệu. Vui lòng import file JSON.
          </div>
        )}
      </div>
    </div>
  );
}
