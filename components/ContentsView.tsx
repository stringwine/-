
import React from 'react';
import { STORY_DATA } from '../constants';
import Button from './Button';
import { List, PlayCircle } from 'lucide-react';

interface ContentsViewProps {
  onBack: () => void;
  onSelectChapter: (index: number) => void;
  currentChapterIndex: number;
}

const ContentsView: React.FC<ContentsViewProps> = ({ onBack, onSelectChapter, currentChapterIndex }) => {
  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-8 border-b border-[#c5a059]/30 pb-4 flex-shrink-0">
        <h1 className="font-cinzel text-4xl text-[#c5a059]">剧目单 Playbill</h1>
        <Button onClick={onBack} variant="outline">返回 Return</Button>
      </div>

      <div className="flex items-center gap-3 mb-8 text-[#c5a059] flex-shrink-0">
        <List size={24} />
        <h2 className="font-cinzel text-2xl uppercase tracking-widest">剧章预览 Chapters</h2>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-12">
        <div className="grid grid-cols-1 gap-4">
          {STORY_DATA.map((chapter, idx) => {
            const isCurrent = idx === currentChapterIndex;
            return (
              <div 
                key={chapter.id}
                onClick={() => onSelectChapter(idx)}
                className={`group relative flex items-center justify-between p-6 rounded-lg border transition-all duration-500 cursor-pointer overflow-hidden
                  ${isCurrent 
                    ? 'bg-[#8b1c1c]/10 border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]' 
                    : 'bg-[#1a1a1a]/40 border-[#c5a059]/10 hover:border-[#c5a059]/40 hover:bg-[#1a1a1a]/60'
                  }`}
              >
                {/* Decorative background element for current chapter */}
                {isCurrent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c5a059]" />
                )}
                
                <div className="flex flex-col gap-1 relative z-10">
                  <span className="font-cinzel text-[10px] tracking-[0.4em] text-[#c5a059]/60 uppercase">
                    第 {chapter.id} 章 Chapter {chapter.id}
                  </span>
                  <h3 className={`font-playfair text-xl md:text-2xl transition-colors ${isCurrent ? 'text-[#f4e4bc]' : 'text-[#f4e4bc]/70 group-hover:text-[#f4e4bc]'}`}>
                    {chapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  {isCurrent && (
                    <span className="font-cinzel text-[10px] text-[#c5a059] tracking-widest animate-pulse hidden md:block uppercase">
                      正在上演 CURRENT STAGE
                    </span>
                  )}
                  <div className={`p-2 rounded-full border transition-all duration-500 ${isCurrent ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10' : 'border-[#c5a059]/20 text-[#c5a059]/30 group-hover:border-[#c5a059]/50 group-hover:text-[#c5a059]'}`}>
                    <PlayCircle size={24} />
                  </div>
                </div>

                {/* Hover highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(0, 0, 0, 0.4); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(197, 160, 89, 0.3); 
          border-radius: 10px; 
          border: 1px solid rgba(197, 160, 89, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 160, 89, 0.5); 
        }
      `}</style>
    </div>
  );
};

export default ContentsView;
