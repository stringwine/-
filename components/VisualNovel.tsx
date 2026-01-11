
import React, { useState, useEffect, useRef } from 'react';
import { DialogueNode, Character } from '../types';
import { ChevronRight, Target } from 'lucide-react';

interface VNProps {
  nodes: DialogueNode[];
  onFinish: () => void;
}

const VisualNovel: React.FC<VNProps> = ({ nodes, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayLength, setDisplayLength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNode = nodes[currentIndex];

  useEffect(() => {
    setDisplayLength(0);
    setIsTyping(true);
    
    const timer = setInterval(() => {
      setDisplayLength((prev) => {
        if (prev < currentNode.text.length) {
          return prev + 1;
        }
        setIsTyping(false);
        clearInterval(timer);
        return prev;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [currentIndex, currentNode.text]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayLength(currentNode.text.length);
      setIsTyping(false);
      return;
    }

    if (currentIndex < nodes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const getCharacterStyles = (char: Character) => {
    switch (char) {
      case 'Argenti': return { color: 'text-[#ff4d4d]', nameBg: 'bg-[#5c1313]', label: 'ARGENTI' };
      case 'Boothill': return { color: 'text-[#e5e7eb]', nameBg: 'bg-[#1a1a1a]', label: 'BOOTHILL' };
      case 'You': return { color: 'text-[#f4e4bc]', nameBg: 'bg-[#4a3b1d]', label: 'YOU' };
      case 'Narrator': return { color: 'text-[#c5a059] italic', nameBg: 'bg-[#2a2a2a]', label: 'ARCHIVES' };
      default: return { color: 'text-white', nameBg: 'bg-black', label: char.toUpperCase() };
    }
  };

  const charStyle = getCharacterStyles(currentNode.character);
  const fullDisplayText = currentNode.text.substring(0, displayLength);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end cursor-pointer overflow-hidden" onClick={handleNext}>
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentNode.background || nodes[0].background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) contrast(1.2) saturate(0.8)'
        }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black via-black/40 to-black opacity-90" />

      {/* Adjusted character container: moved up by increasing pb-4 to pb-20 and adjusting height to h-[60%] */}
      <div className="relative z-10 w-full flex justify-center h-[60%] items-end pointer-events-none pb-20">
        
        {/* Argenti: Stylized Rose UI (🌹) */}
        {currentNode.character === 'Argenti' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-900/20 blur-[80px] rounded-full scale-150" />
              
              <div className="w-48 h-48 md:w-56 md:h-56 border border-red-900/30 rounded-full flex items-center justify-center backdrop-blur-sm bg-red-950/20 shadow-2xl transition-all duration-700">
                <div className="relative flex flex-col items-center justify-center">
                  <div className="text-7xl md:text-8xl drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-pulse select-none filter brightness-110 saturate-150">
                    🌹
                  </div>
                  <div className="absolute -inset-4 border border-red-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute -inset-2 border border-red-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-red-500/60 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
                </div>
              </div>
              <div className="mt-4 font-cinzel text-red-500 tracking-[0.6em] text-center text-lg md:text-xl font-bold drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">ARGENTI</div>
            </div>
          </div>
        )}

        {/* Boothill: Gunsmoke Emblem */}
        {currentNode.character === 'Boothill' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-400/10 blur-[80px] rounded-full scale-150" />
              <div className="w-48 h-48 md:w-56 md:h-56 border border-slate-400/20 rounded-full flex items-center justify-center backdrop-blur-sm bg-slate-900/10 shadow-2xl">
                <div className="relative flex items-center justify-center">
                   <Target size={100} className="text-slate-300/80 drop-shadow-[0_0_20px_rgba(203,213,225,0.6)]" />
                   <div className="absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-slate-100 to-transparent shadow-[0_0_15px_white] animate-pulse" />
                </div>
              </div>
              <div className="mt-4 font-cinzel text-slate-300 tracking-[0.5em] text-center text-base md:text-lg font-semibold">BOOTHILL</div>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-20 w-full max-w-5xl px-6 pb-24 md:pb-28">
        <div className="bg-[#080808]/90 border-t border-x border-[#c5a059]/20 rounded-t-3xl p-8 md:p-10 shadow-[0_-30px_100px_rgba(0,0,0,0.95)] backdrop-blur-3xl min-h-[200px] md:min-h-[220px] flex flex-col relative transition-all duration-700">
          
          <div className={`absolute -top-6 left-8 md:left-12 ${charStyle.nameBg} border border-[#c5a059]/50 px-8 md:px-10 py-2 rounded-full shadow-2xl overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <span className={`font-cinzel text-base md:text-lg tracking-[0.3em] font-bold ${charStyle.color} relative z-10 uppercase`}>
              {charStyle.label}
            </span>
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto pr-4 custom-scrollbar pt-2"
          >
            <p className={`text-lg md:text-2xl leading-[1.8] font-playfair ${charStyle.color} ${currentNode.character === 'Narrator' ? 'text-center opacity-80 italic tracking-wide' : 'drop-shadow-sm'}`}>
              {fullDisplayText}
            </p>
          </div>

          <div className="flex justify-end pt-4">
            {!isTyping && (
              <div className="group flex items-center gap-3 text-[#c5a059]/30 font-cinzel text-[10px] md:text-[11px] tracking-[0.3em] animate-pulse uppercase cursor-pointer hover:text-[#c5a059]/60 transition-colors">
                继续 Proceed
                <div className="p-1 border border-[#c5a059]/20 rounded-full group-hover:border-[#c5a059]/50">
                  <ChevronRight size={14} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(197, 160, 89, 0.15);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default VisualNovel;
