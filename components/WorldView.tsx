
import React from 'react';
import { WORLD_DATA, RANK_TITLES, LOCKED_MEMORIES } from '../constants';
import Button from './Button';
import { UserProgress } from '../types';
import { Scroll, Users, Map, Star, Lock } from 'lucide-react';

interface WorldViewProps {
  onBack: () => void;
  progress: UserProgress;
}

const WorldView: React.FC<WorldViewProps> = ({ onBack, progress }) => {
  // Calculate total focus count (f = (level - 1) * 2 + (exp === 0.5 ? 1 : 0))
  const totalFocusCount = (progress.level - 1) * 2 + (progress.exp === 0.5 ? 1 : 0);
  const currentRank = RANK_TITLES[Math.min(totalFocusCount, RANK_TITLES.length - 1)];

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto animate-fade-in pb-24 custom-scrollbar">
      <div className="flex items-center justify-between mb-8 border-b border-[#c5a059]/30 pb-4">
        <h1 className="font-cinzel text-4xl text-[#c5a059]">秘密档案 Archives</h1>
        <Button onClick={onBack} variant="outline">返回 Return</Button>
      </div>

      {/* Section: 开拓等级 Trailblaze Rank */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 text-[#c5a059]">
          <Star size={24} />
          <h2 className="font-cinzel text-2xl uppercase tracking-widest">开拓等级 Trailblaze Rank</h2>
        </div>
        <div className="bg-[#8b1c1c]/5 p-8 rounded-lg border border-[#c5a059]/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-2 border-[#c5a059] flex items-center justify-center bg-[#1a1a1a] shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                <span className="font-cinzel text-4xl text-[#c5a059]">{progress.level}</span>
              </div>
              <span className="font-cinzel text-[11px] text-[#c5a059]/70 mt-3 tracking-[0.5em] uppercase">RANK</span>
            </div>

            <div className="flex-grow w-full">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="font-cinzel text-xl text-[#f4e4bc] tracking-wider flex items-center gap-2 whitespace-nowrap">
                    {currentRank.zh}
                    <span className="text-[#c5a059]/40 text-[10px] tracking-normal mt-1 ml-1">{currentRank.en.toUpperCase()}</span>
                  </span>
                </div>
                <span className="font-cinzel text-sm text-[#c5a059]/80 uppercase">
                  {Math.round(progress.exp * 100)}% 契合度
                </span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full border border-[#c5a059]/20 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#8b1c1c] via-[#c5a059] to-[#f4e4bc] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                  style={{ width: `${progress.exp * 100}%` }}
                />
              </div>
              <p className="mt-4 text-[#f4e4bc]/60 font-playfair italic text-sm">
                "在这永恒的剧场中，你的每一次驻足都让记忆更加清晰。 Focus yields true beauty."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4 text-[#c5a059]">
          <Map size={24} />
          <h2 className="font-cinzel text-2xl uppercase tracking-widest">编年史 Chronicle</h2>
        </div>
        <div className="bg-[#1a1a1a]/80 p-6 rounded-lg border border-[#c5a059]/20 font-playfair leading-relaxed">
          {WORLD_DATA.background}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 text-[#c5a059]">
          <Users size={24} />
          <h2 className="font-cinzel text-2xl uppercase tracking-widest">关键人物 Key Figures</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORLD_DATA.characters.map((char, idx) => (
            <div key={idx} className="bg-[#1a1a1a]/80 p-6 rounded-lg border border-[#c5a059]/20 hover:border-[#c5a059]/50 transition-colors">
              <h3 className="font-cinzel text-xl text-[#c5a059] mb-1">{char.name}</h3>
              <p className="text-[#8b1c1c] text-sm mb-3 italic">{char.role}</p>
              <p className="text-[#f4e4bc]/80 text-sm font-playfair">{char.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: 尘封记忆 Locked Memories */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 text-[#c5a059]">
          <Scroll size={24} />
          <h2 className="font-cinzel text-2xl uppercase tracking-widest">尘封记忆 Locked Memories</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {LOCKED_MEMORIES.map((memory, index) => {
            const isUnlocked = totalFocusCount >= (index + 1) * 2;
            
            if (isUnlocked) {
              return (
                <div key={memory.id} className="relative bg-[#1a1a1a]/90 p-8 rounded-lg border border-[#c5a059]/40 shadow-xl animate-fade-in group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Scroll size={60} className="text-[#c5a059]" />
                  </div>
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center gap-3 border-b border-[#c5a059]/20 pb-2">
                      <span className="font-cinzel text-[#c5a059] text-sm tracking-widest">🔹 记忆 · {memory.id}</span>
                      <h3 className="font-playfair text-2xl text-[#f4e4bc] font-bold">《{memory.title}》</h3>
                    </div>
                    <p className="text-[#f4e4bc]/90 font-playfair text-lg leading-loose whitespace-pre-wrap italic">
                      {memory.content}
                    </p>
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#c5a059]/10 to-transparent pointer-events-none" />
                </div>
              );
            } else {
              return (
                <div key={memory.id} className="bg-black/40 p-12 text-center rounded-lg border-2 border-dashed border-[#c5a059]/10 group">
                  <div className="flex flex-col items-center gap-4">
                    <Lock size={32} className="text-[#c5a059]/20 group-hover:text-[#c5a059]/40 transition-colors" />
                    <p className="font-cinzel text-sm text-[#c5a059]/40 tracking-widest uppercase">
                      Memory {memory.id} is Locked
                    </p>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                       <div 
                         className="h-full bg-[#8b1c1c]/40 transition-all duration-500" 
                         style={{ width: `${Math.min(100, (totalFocusCount / ((index + 1) * 2)) * 100)}%` }}
                       />
                    </div>
                    <span className="text-[10px] font-cinzel text-[#c5a059]/20 uppercase">
                      Progress: {totalFocusCount}/{(index + 1) * 2} Focus
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </section>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      `}</style>
    </div>
  );
};

export default WorldView;
