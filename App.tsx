
import React, { useState, useEffect } from 'react';
import { GameState, UserProgress } from './types';
import { STORY_DATA } from './constants';
import VisualNovel from './components/VisualNovel';
import TimerView from './components/TimerView';
import WorldView from './components/WorldView';
import ContentsView from './components/ContentsView';
import Button from './components/Button';
import { BookOpen, Timer, Archive, Award, List } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isChapterCompleted, setIsChapterCompleted] = useState(false);
  const [petals, setPetals] = useState<{ id: number, left: string, delay: string, duration: string }[]>([]);
  
  // Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('argenti_progress');
    return saved ? JSON.parse(saved) : { level: 1, exp: 0 };
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('argenti_progress', JSON.stringify(progress));
  }, [progress]);

  // Simple background effect
  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`
    }));
    setPetals(newPetals);
  }, []);

  const handleStartChapter = () => {
    setGameState('STORY');
    setIsChapterCompleted(false);
  };

  const handleFinishStory = () => {
    setGameState('TIMER');
  };

  const handleSelectChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setGameState('STORY');
    setIsChapterCompleted(false);
  };

  const handleTimerComplete = () => {
    setIsChapterCompleted(true);
    
    // Reward Logic: +0.5 Exp
    setProgress(prev => {
      const newExp = prev.exp + 0.5;
      if (newExp >= 1) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
        return { level: prev.level + 1, exp: 0 };
      }
      return { ...prev, exp: newExp };
    });

    if (currentChapterIndex < STORY_DATA.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    }
    setGameState('INTRO');
  };

  const currentChapter = STORY_DATA[currentChapterIndex];

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Global Petal Animation */}
      {petals.map(p => (
        <div 
          key={p.id}
          className="petal text-red-700/30 text-xl"
          style={{ 
            left: p.left, 
            animation: `fall ${p.duration} linear infinite`,
            animationDelay: p.delay,
            top: '-20px'
          }}
        >
          🌹
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Level Up Toast */}
      {showLevelUp && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[100] animate-bounce pointer-events-none">
          <div className="bg-[#8b1c1c] border border-[#c5a059] px-6 py-3 rounded-full shadow-[0_0_30px_rgba(139,28,28,0.8)] flex items-center gap-3">
            <Award className="text-[#c5a059]" />
            <span className="font-cinzel text-[#f4e4bc] tracking-widest text-sm">审美等阶提升 Rank Up!</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 overflow-hidden">
        {gameState === 'INTRO' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-y-auto">
            {/* Level Badge UI */}
            <div className="-mt-12 mb-10 flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative p-4 border border-[#c5a059]/30 rounded-full mb-2">
                <div className="absolute inset-0 bg-[#c5a059]/5 blur-xl rounded-full" />
                <span className="relative font-cinzel text-[#c5a059] text-xs tracking-[0.4em] uppercase">Rank {progress.level}</span>
              </div>
              <div className="w-32 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden border border-[#c5a059]/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#8b1c1c] to-[#c5a059] transition-all duration-1000"
                  style={{ width: `${progress.exp * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-cinzel text-[#c5a059]/40 mt-1 uppercase tracking-widest">
                {progress.exp === 0.5 ? "半步纯美 Halfway to Perfection" : "静候启示 Awaiting Inspiration"}
              </span>
            </div>

            <div className="mb-12 relative">
                <div className="absolute inset-0 bg-red-900/20 blur-3xl rounded-full" />
                <h1 className="relative font-cinzel text-5xl md:text-7xl text-[#c5a059] mb-4 tracking-tighter">
                  Rose & GUN
                </h1>
                <p className="relative font-playfair italic text-[#f4e4bc]/60 text-lg">
                  Where blood meets steel under the theater's moon
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button onClick={handleStartChapter} className="w-full text-lg">
                {currentChapterIndex === 0 ? '开启演出 Enter Theatre' : `开始第 ${currentChapter.id} 章 Begin Ch.${currentChapter.id}`}
              </Button>
              <Button variant="secondary" onClick={() => setGameState('CONTENTS')} className="w-full">
                剧目单 Playbill
              </Button>
              <Button variant="outline" onClick={() => setGameState('WORLDVIEW')} className="w-full">
                秘密档案 Archives
              </Button>
            </div>

            {isChapterCompleted && (
              <div className="mt-8 text-[#8b1c1c] animate-pulse font-cinzel text-sm uppercase tracking-widest">
                专注力回收 Concentration Achieved.
              </div>
            )}
          </div>
        )}

        {gameState === 'STORY' && (
          <VisualNovel 
            nodes={currentChapter.nodes} 
            onFinish={handleFinishStory} 
          />
        )}

        {gameState === 'TIMER' && (
          <TimerView 
            durationMinutes={currentChapter.focusRequirementMinutes}
            title={currentChapter.focusTitle}
            description={currentChapter.focusDescription}
            onComplete={handleTimerComplete}
            onCancel={() => setGameState('INTRO')}
          />
        )}

        {gameState === 'WORLDVIEW' && (
          <WorldView onBack={() => setGameState('INTRO')} />
        )}

        {gameState === 'CONTENTS' && (
          <ContentsView 
            onBack={() => setGameState('INTRO')} 
            onSelectChapter={handleSelectChapter}
            currentChapterIndex={currentChapterIndex}
          />
        )}
      </main>

      {/* Navigation Bar (Sticky Bottom) */}
      <nav className="h-20 bg-black/90 border-t border-[#c5a059]/20 flex items-center justify-around px-4 relative z-50 flex-shrink-0">
        <button 
          onClick={() => setGameState('INTRO')}
          className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'INTRO' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}
        >
          <BookOpen size={24} />
          <span className="text-[10px] uppercase font-cinzel">舞台 Stage</span>
        </button>
        <button 
          onClick={() => setGameState('CONTENTS')}
          className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'CONTENTS' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}
        >
          <List size={24} />
          <span className="text-[10px] uppercase font-cinzel">目录 Menu</span>
        </button>
        <button 
          onClick={() => setGameState('TIMER')}
          className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'TIMER' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}
        >
          <Timer size={24} />
          <span className="text-[10px] uppercase font-cinzel">专注 Clock</span>
        </button>
        <button 
          onClick={() => setGameState('WORLDVIEW')}
          className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'WORLDVIEW' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}
        >
          <Archive size={24} />
          <span className="text-[10px] uppercase font-cinzel">档案 Files</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
