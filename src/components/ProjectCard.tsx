import React, { useState } from 'react';
import { ExternalLink, Copy, Check, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { trackProjectClick } from '../lib/firebase';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const handleCopy = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        toast.success('Đã copy link thành công!');
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        toast.success('Đã copy mã ref thành công!');
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      toast.error('Không thể copy vào bộ nhớ tạm');
    }
  };

  const handleAction = () => {
    if (project.id) trackProjectClick(project.id);
    window.open(project.refLink, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-dark rounded-2xl overflow-hidden group border border-white/5 hover:border-violet-500/30 transition-all duration-300 flex flex-col h-full"
    >
      {/* Banner */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0">
        <img 
          src={project.image || 'https://picsum.photos/seed/project/800/450'} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
      </div>

      <div className="p-6 space-y-4 flex flex-col flex-1">
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight flex items-center gap-2 line-clamp-1">
            {project.title}
          </h3>
          <div className="relative">
            <p className={cn(
              "text-slate-400 text-sm leading-relaxed transition-all duration-300",
              !showFullDesc && "line-clamp-3"
            )}>
              {project.description}
            </p>
            {project.description && project.description.length > 120 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDesc(!showFullDesc);
                }}
                className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-1 hover:text-violet-300 transition-colors"
              >
                {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Ref Link Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Link Ref</span>
            <div className="relative flex items-center">
              <input
                readOnly
                value={project.refLink}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-300 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(project.refLink, 'link')}
                className="absolute right-2 text-slate-400 hover:text-violet-400 transition-colors"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {copiedLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 right-0 bg-green-500 text-white text-[10px] px-2 py-1 rounded"
                  >
                    Đã copy link
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Ref Code Section */}
          {project.refCode && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Mã Ref</span>
              <div className="relative flex items-center">
                <input
                  readOnly
                  value={project.refCode}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(project.refCode, 'code')}
                  className="absolute right-2 text-slate-400 hover:text-violet-400 transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {copiedCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-8 right-0 bg-violet-500 text-white text-[10px] px-2 py-1 rounded"
                    >
                      Đã copy mã
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAction}
          className="w-full gradient-bg py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-violet-500/20 active:scale-95 transition-all group/btn"
        >
          <span>LÀM NGAY</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
