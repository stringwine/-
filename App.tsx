
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, UserProgress } from './types';
import { STORY_DATA, RANK_TITLES } from './constants';
import VisualNovel from './components/VisualNovel';
import TimerView from './components/TimerView';
import WorldView from './components/WorldView';
import ContentsView from './components/ContentsView';
import Button from './components/Button';
import { BookOpen, Timer, Archive, Award, List, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- 1. 状态恢复核心逻辑 ---
  
  // 恢复已积攒的等阶
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('argenti_progress');
      return saved ? JSON.parse(saved) : { level: 1, exp: 0 };
    } catch { return { level: 1, exp: 0 }; }
  });

  // 恢复所在的章节
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('argenti_chapter_index');
      return saved ? Math.min(parseInt(saved, 10), STORY_DATA.length - 1) : 0;
    } catch { return 0; }
  });

  // 判定启动时的游戏阶段
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const timerTarget = localStorage.getItem('argenti_timer_target');
      const pausedSeconds = localStorage.getItem('argenti_timer_paused_seconds');
      
      // 如果存在正在运行的计时器
      if (timerTarget) {
        const target = parseInt(timerTarget, 10);
        // 如果 App 关闭期间已经过期，视为放弃，回到 INTRO
        if (target <= Date.now()) {
          localStorage.removeItem('argenti_timer_target');
          return 'INTRO';
        }
        return 'TIMER';
      }
      
      // 如果存在暂停中的计时器，恢复到计时界面
      if (pausedSeconds) return 'TIMER';

      const savedState = localStorage.getItem('argenti_game_state');
      // 如果上次是因为非正常关闭导致的运行中退出，强制回到 INTRO
      if (savedState === 'TIMER' && !timerTarget && !pausedSeconds) return 'INTRO';
      
      return (savedState as GameState) || 'INTRO';
    } catch { return 'INTRO'; }
  });

  const [isChapterCompleted, setIsChapterCompleted] = useState(() => {
    return localStorage.getItem('argenti_chapter_completed') === 'true';
  });

  // 监测是否发生了专注中断
  const [wasInterrupted, setWasInterrupted] = useState(false);

  // --- 2. 其它状态变量 ---
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [unlockedMemoryId, setUnlockedMemoryId] = useState<string | null>(null);
  const [petals, setPetals] = useState<{ id: number, left: string, delay: string, duration: string }[]>([]);

  // --- 3. 专注结算逻辑 ---
  const handleTimerComplete = useCallback(() => {
    setIsChapterCompleted(true);
    localStorage.removeItem('argenti_timer_target'); 
    localStorage.removeItem('argenti_timer_paused_seconds');
    
    setProgress(prev => {
      const oldTotal = (prev.level - 1) * 2 + (prev.exp === 0.5 ? 1 : 0);
      const newTotal = oldTotal + 1;

      // 记忆解锁逻辑
      if (newTotal % 2 === 0) {
        const memoryIdx = newTotal / 2;
        if (memoryIdx <= 10) {
          setUnlockedMemoryId(memoryIdx.toString().padStart(2, '0'));
          setTimeout(() => setUnlockedMemoryId(null), 5000);
        }
      }

      const newExp = prev.exp + 0.5;
      if (newExp >= 1) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
        return { level: prev.level + 1, exp: 0 };
      }
      return { ...prev, exp: newExp };
    });

    setCurrentChapterIndex(prev => {
      const next = prev < STORY_DATA.length - 1 ? prev + 1 : prev;
      localStorage.setItem('argenti_chapter_index', next.toString());
      return next;
    });

    setGameState('INTRO');
  }, []);

  // --- 4. 退出行为监测 ---
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timerTarget = localStorage.getItem('argenti_timer_target');
      if (timerTarget) {
        // 如果正在运行时退出，标记为“放弃”：销毁 target
        localStorage.removeItem('argenti_timer_target');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 检查启动时的中断
  useEffect(() => {
    const savedState = localStorage.getItem('argenti_game_state');
    const timerTarget = localStorage.getItem('argenti_timer_target');
    const pausedSeconds = localStorage.getItem('argenti_timer_paused_seconds');
    
    if (savedState === 'TIMER' && !timerTarget && !pausedSeconds) {
      setWasInterrupted(true);
      setTimeout(() => setWasInterrupted(false), 6000);
    }
  }, []);

  // --- 5. 持久化同步 ---
  useEffect(() => {
    localStorage.setItem('argenti_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('argenti_chapter_index', currentChapterIndex.toString());
  }, [currentChapterIndex]);

  useEffect(() => {
    localStorage.setItem('argenti_game_state', gameState);
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('argenti_chapter_completed', isChapterCompleted.toString());
  }, [isChapterCompleted]);

  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`
    }));
    setPetals(newPetals);
  }, []);

  // --- 6. 视图处理 ---
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

  const handleCancelTimer = () => {
    localStorage.removeItem('argenti_timer_target');
    localStorage.removeItem('argenti_timer_paused_seconds');
    setGameState('INTRO');
  };

  const currentChapter = STORY_DATA[currentChapterIndex];
  const totalFocusCount = (progress.level - 1) * 2 + (progress.exp === 0.5 ? 1 : 0);
  const currentRank = RANK_TITLES[Math.min(totalFocusCount, RANK_TITLES.length - 1)];

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* 视觉特效 */}
      {petals.map(p => (
        <div key={p.id} className="petal text-red-700/30 text-xl" style={{ left: p.left, animation: `fall ${p.duration} linear infinite`, animationDelay: p.delay, top: '-20px' }}>🌹</div>
      ))}
      <style>{`
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.5; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* 中断提示 */}
      {wasInterrupted && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] animate-bounce pointer-events-none">
          <div className="bg-[#1a1a1a]/90 border border-[#8b1c1c] px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xl backdrop-blur-md">
            <AlertCircle size={16} className="text-[#8b1c1c]" />
            <span className="font-cinzel text-[#f4e4bc] text-[10px] tracking-widest uppercase">专注已被收割 Rhythm Interrupted</span>
          </div>
        </div>
      )}

      {/* 升级提示 */}
      {showLevelUp && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[100] animate-bounce pointer-events-none">
          <div className="bg-[#8b1c1c] border border-[#c5a059] px-6 py-3 rounded-full shadow-[0_0_30px_rgba(139,28,28,0.8)] flex items-center gap-3">
            <Award className="text-[#c5a059]" />
            <span className="font-cinzel text-[#f4e4bc] tracking-widest text-sm uppercase">审美等阶提升 Rank Up!</span>
          </div>
        </div>
      )}

      {/* 记忆解锁 */}
      {unlockedMemoryId && (
        <div className="absolute bottom-28 right-6 z-[100] animate-slide-in-right pointer-events-none">
          <div className="bg-[#1a1a1a]/95 border border-[#c5a059]/60 px-5 py-3 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col items-end gap-1">
             <div className="flex items-center gap-2 text-[#c5a059]">
               <span className="font-cinzel text-xs tracking-widest uppercase">Memory #{unlockedMemoryId} Unlocked</span>
             </div>
          </div>
        </div>
      )}

      <main className="flex-grow relative z-10 overflow-hidden">
        {gameState === 'INTRO' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-y-auto custom-scrollbar">
            {/* 角色等阶卡片 - 此时应显示积攒下来的等级 */}
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
              <div className="text-[#c5a059]/40 mt-1 flex items-center gap-2 whitespace-nowrap">
                <span className="font-kaiti text-xs tracking-widest">{currentRank.zh}</span>
                <span className="font-cinzel text-[8px] opacity-60 tracking-normal uppercase">{currentRank.en}</span>
              </div>
            </div>

            <div className="mb-12 relative">
                <div className="absolute inset-0 bg-red-900/20 blur-3xl rounded-full" />
                <h1 className="relative font-cinzel text-5xl md:text-7xl text-[#c5a059] mb-4 tracking-tighter">Rose & GUN</h1>
                <p className="relative font-playfair italic text-[#f4e4bc]/60 text-lg">Where blood meets steel under the theater's moon</p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button onClick={handleStartChapter} className="w-full text-lg">
                {currentChapterIndex === 0 && !isChapterCompleted ? '开启演出 Enter Theatre' : `开始第 ${currentChapter.id} 章 Begin Ch.${currentChapter.id}`}
              </Button>
              <Button variant="secondary" onClick={() => setGameState('CONTENTS')} className="w-full">剧目单 Playbill</Button>
              <Button variant="outline" onClick={() => setGameState('WORLDVIEW')} className="w-full">秘密档案 Archives</Button>
            </div>
          </div>
        )}

        {gameState === 'STORY' && (
          <VisualNovel nodes={currentChapter.nodes} onFinish={handleFinishStory} />
        )}

        {gameState === 'TIMER' && (
          <TimerView 
            durationMinutes={currentChapter.focusRequirementMinutes}
            title={currentChapter.focusTitle}
            description={currentChapter.focusDescription}
            onComplete={handleTimerComplete}
            onCancel={handleCancelTimer}
          />
        )}

        {gameState === 'WORLDVIEW' && (
          <WorldView progress={progress} onBack={() => setGameState('INTRO')} />
        )}

        {gameState === 'CONTENTS' && (
          <ContentsView onBack={() => setGameState('INTRO')} onSelectChapter={handleSelectChapter} currentChapterIndex={currentChapterIndex} />
        )}
      </main>

      {/* 底部导航 */}
      <nav className="h-20 bg-black/90 border-t border-[#c5a059]/20 flex items-center justify-around px-4 relative z-50 flex-shrink-0">
        <button onClick={() => setGameState('INTRO')} className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'INTRO' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}>
          <BookOpen size={24} />
          <span className="text-[10px] uppercase font-cinzel">舞台 Stage</span>
        </button>
        <button onClick={() => setGameState('CONTENTS')} className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'CONTENTS' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}>
          <List size={24} />
          <span className="text-[10px] uppercase font-cinzel">目录 Menu</span>
        </button>
        <button onClick={() => setGameState('TIMER')} className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'TIMER' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}>
          <Timer size={24} />
          <span className="text-[10px] uppercase font-cinzel">专注 Clock</span>
        </button>
        <button onClick={() => setGameState('WORLDVIEW')} className={`flex flex-col items-center gap-1 transition-colors ${gameState === 'WORLDVIEW' ? 'text-[#c5a059]' : 'text-[#f4e4bc]/40 hover:text-[#c5a059]/60'}`}>
          <Archive size={24} />
          <span className="text-[10px] uppercase font-cinzel">档案 Files</span>
        </button>
      </nav>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 0; }`}</style>
    </div>
  );
};

export default App;
