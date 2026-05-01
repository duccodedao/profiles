import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Edit2, FileText, FileArchive, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { toSafeDate } from '../../lib/utils';
import { useConfirmStore } from '../../store/confirmStore';
import EmptyState from '../../components/admin/EmptyState';

export default function AdminFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const { openConfirm } = useConfirmStore();

  useEffect(() => {
    const q = query(collection(db, 'sharedFiles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleDelete = (file: any) => {
    openConfirm({
      title: 'Xóa file',
      message: `Bạn có chắc chắn muốn xóa file ${file.name}?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'sharedFiles', file.id));
          toast.success('Đã xóa file!');
        } catch (err) {
          toast.error('Lỗi khi xóa file.');
        }
      }
    });
  };

  const handleEdit = async (file: any) => {
    const newName = prompt('Nhập tên file mới:', file.name);
    if (newName && newName !== file.name) {
      try {
        await updateDoc(doc(db, 'sharedFiles', file.id), { name: newName });
        toast.success('Đã đổi tên file!');
      } catch (err) {
        toast.error('Lỗi khi đổi tên file.');
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (['zip', 'rar', '7z'].includes(type.toLowerCase())) return <FileArchive className="w-8 h-8 text-orange-500" />;
    if (['pdf', 'doc', 'docx'].includes(type.toLowerCase())) return <FileText className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý File</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900 dark:text-white">
          <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500">
            <tr>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-0">
                  <EmptyState title="File" />
                </td>
              </tr>
            ) : (
              files.map(file => (
                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <span className="font-medium">{file.name}</span>
                  </td>
                  <td className="px-6 py-4">{file.type}</td>
                  <td className="px-6 py-4">{file.createdAt ? format(toSafeDate(file.createdAt), 'dd/MM/yyyy') : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(file)} className="text-blue-500 hover:text-blue-600 p-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(file)} className="text-red-500 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
