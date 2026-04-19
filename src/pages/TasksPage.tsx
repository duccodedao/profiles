import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Task, TaskSubmission } from '../types';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, CheckCircle2, ChevronRight, Loader2, Rocket, ShieldCheck, Send, X, AlertCircle, Search } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function TasksPage() {
  const [user] = useAuthState(auth);
  const [tasks, loading] = useCollectionData(query(collection(db, 'tasks'), where('status', '==', 'active'))) as unknown as [Task[] | undefined, boolean, ...any[]];
  
  const subQuery = user ? query(collection(db, 'taskSubmissions'), where('userId', '==', user.uid)) : null;
  const [submissionsData] = useCollectionData(subQuery) as unknown as [TaskSubmission[] | undefined, boolean, ...any[]];

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks?.filter(t => 
    searchTerm === '' || t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTask) return;
    if (!proof.trim()) {
      toast.error('Vui lòng nhập bằng chứng hoàn thành');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if already submitted
      const q = query(
        collection(db, 'taskSubmissions'), 
        where('userId', '==', user.uid),
        where('taskId', '==', selectedTask.id),
        where('status', '==', 'pending')
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        toast.error('Bạn đã gửi yêu cầu cho nhiệm vụ này rồi');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'taskSubmissions'), {
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        proof,
        status: 'pending',
        reward: selectedTask.reward,
        createdAt: serverTimestamp()
      });

      toast.success('Đã gửi yêu cầu! Vui lòng đợi admin duyệt.');
      setSelectedTask(null);
      setProof('');
    } catch (err) {
      toast.error('Lỗi khi gửi yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12 py-10">
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-violet-600/10 rounded-3xl flex items-center justify-center mx-auto border border-violet-600/20 shadow-2xl shadow-violet-600/10 mb-6"
          >
            <ListTodo className="w-8 h-8 text-violet-400" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Nhiệm vụ hàng ngày</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Hoàn thành các nhiệm vụ đơn giản để nhận phần thưởng hấp dẫn trực tiếp vào ví.
          </p>
          <div className="max-w-xl mx-auto pt-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm nhiệm vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white placeholder-slate-500 font-medium"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-dark h-[300px] rounded-[40px] animate-pulse border border-white/5" />
            ))
          ) : filteredTasks?.length === 0 ? (
            <div className="col-span-full py-20 text-center glass rounded-[40px] border border-white/5 space-y-4 text-slate-500 italic">
              <Rocket className="w-12 h-12 mx-auto opacity-10" />
              <p>Hiện tại không có nhiệm vụ nào diễn ra hoặc phù hợp với tìm kiếm.</p>
            </div>
          ) : (
            filteredTasks?.map((task, i) => {
              // Check if user has pending or approved submission for this task
              const submission = submissionsData?.find(s => s.taskId === task.id && (s.status === 'pending' || s.status === 'approved'));
              const isCompleted = submission && submission.status === 'approved';
              
              return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => !submission && setSelectedTask(task)}
                className={cn("group relative", !submission ? "cursor-pointer" : isCompleted ? "opacity-40 grayscale pointer-events-none" : "cursor-not-allowed opacity-80")}
              >
                {!submission && <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-pink-600/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                <div className="relative glass-dark p-8 rounded-[40px] border border-white/5 space-y-6 h-full flex flex-col justify-between group-hover:border-violet-500/30 transition-all duration-300 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                        <Rocket className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex items-center gap-2">
                        {submission && (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            submission.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {submission.status === 'approved' ? 'Đã hoàn thành' : 'Đang duyệt'}
                          </span>
                        )}
                        <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                           <span className="text-emerald-400 font-black text-sm">+{(task.reward || 0).toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white line-clamp-2 leading-none uppercase italic">{task.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{task.description}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{task.steps?.length || 0} BƯỚC THỰC HIỆN</span>
                    {!submission && (
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )})
          )}
        </div>

        {/* Task Detail Modal */}
        <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedTask(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="relative z-10 max-w-2xl w-full glass-dark p-8 md:p-12 rounded-[50px] border border-white/10 space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
              >
                <div className="flex justify-between items-start gap-4">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 uppercase font-black tracking-widest text-xs">
                        <ShieldCheck className="w-4 h-4" /> THƯỞNG {(selectedTask.reward || 0).toLocaleString()}đ
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-none uppercase italic">{selectedTask.title}</h2>
                   </div>
                   <button onClick={() => setSelectedTask(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all">
                      <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Hướng dẫn thực hiện:</h4>
                    <div className="space-y-3">
                      {selectedTask.steps?.map((step, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-violet-500/30 transition-all">
                          <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center shrink-0 font-black shadow-lg shadow-violet-500/20">
                            {idx + 1}
                          </div>
                          <p className="text-slate-200 font-medium pt-1 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 pt-6 mt-6 border-t border-white/5">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                          <Send className="w-3.5 h-3.5 text-violet-400" /> gửi bằng chứng hoàn thành (VD: Tên User, STK...)
                        </label>
                        <textarea
                          required
                          value={proof}
                          onChange={e => setProof(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-200 text-sm"
                          placeholder="Nhập thông tin xác minh mà admin yêu cầu tại đây..."
                        />
                     </div>
                     <button
                        disabled={isSubmitting}
                        className="w-full gradient-bg py-5 rounded-3xl font-black text-white shadow-2xl shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        XÁC NHẬN HOÀN THÀNH
                      </button>
                      <p className="text-[10px] text-center text-slate-500 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                         <AlertCircle className="w-3 h-3" /> lưu ý: gian lận sẽ bị khóa tài khoản vĩnh viễn
                      </p>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
