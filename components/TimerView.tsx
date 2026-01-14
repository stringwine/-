
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Button from './Button';

interface TimerViewProps {
  durationMinutes: number;
  title: string;
  description: string;
  onComplete: () => void;
  onCancel: () => void;
}

const TimerView: React.FC<TimerViewProps> = ({ durationMinutes, title, description, onComplete, onCancel }) => {
  // --- 状态管理 ---
  
  // 当前章节要求的基准时长（秒）
  const baseDurationSeconds = durationMinutes * 60;

  // 用户可能自定义后的总时长（秒）
  const [totalSeconds, setTotalSeconds] = useState(() => {
    const saved = localStorage.getItem('argenti_timer_total_seconds');
    return saved ? parseInt(saved, 10) : baseDurationSeconds;
  });

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const timerTarget = localStorage.getItem('argenti_timer_target');
    if (timerTarget) {
      const remaining = Math.max(0, Math.ceil((parseInt(timerTarget, 10) - Date.now()) / 1000));
      return remaining;
    }
    const pausedSeconds = localStorage.getItem('argenti_timer_paused_seconds');
    if (pausedSeconds) {
      return parseInt(pausedSeconds, 10);
    }
    return totalSeconds;
  });

  const [isActive, setIsActive] = useState(() => {
    return !!localStorage.getItem('argenti_timer_target');
  });

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const targetEndTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.log('Wake Lock request failed');
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      const savedTarget = localStorage.getItem('argenti_timer_target');
      if (savedTarget) {
        targetEndTimeRef.current = parseInt(savedTarget, 10);
      } else {
        const newTarget = Date.now() + secondsLeft * 1000;
        targetEndTimeRef.current = newTarget;
        localStorage.setItem('argenti_timer_target', newTarget.toString());
        localStorage.removeItem('argenti_timer_paused_seconds');
      }
      
      requestWakeLock();

      interval = setInterval(() => {
        if (targetEndTimeRef.current) {
          const now = Date.now();
          const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
          setSecondsLeft(remaining);
          if (remaining === 0) {
            handleFinished();
          }
        }
      }, 200);
    } else {
      targetEndTimeRef.current = null;
      localStorage.removeItem('argenti_timer_target');
      localStorage.setItem('argenti_timer_paused_seconds', secondsLeft.toString());
      releaseWakeLock();
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
      releaseWakeLock();
    };
  }, [isActive]);

  const handleFinished = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    localStorage.removeItem('argenti_timer_target');
    localStorage.removeItem('argenti_timer_paused_seconds');
    localStorage.removeItem('argenti_timer_total_seconds');
    releaseWakeLock();
    onComplete();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && targetEndTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
        setSecondsLeft(remaining);
        if (remaining === 0) {
          handleFinished();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, onComplete]);

  const handleCancel = () => {
    localStorage.removeItem('argenti_timer_target');
    localStorage.removeItem('argenti_timer_paused_seconds');
    localStorage.removeItem('argenti_timer_total_seconds');
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isActive) return "FOCUSING";
    if (secondsLeft < totalSeconds) return "PAUSED";
    return "WAITING";
  };

  // 自定义时间处理
  const startEditing = () => {
    if (isActive) return; // 运行中不可编辑
    setEditValue(Math.floor(totalSeconds / 60).toString());
    setIsEditing(true);
  };

  const saveEdit = () => {
    const newMins = parseInt(editValue, 10);
    // 根据最新要求，不再限制必须大于已有时间，只要是正数即可
    if (!isNaN(newMins) && newMins > 0) {
      const newTotalSeconds = newMins * 60;
      setTotalSeconds(newTotalSeconds);
      setSecondsLeft(newTotalSeconds);
      localStorage.setItem('argenti_timer_total_seconds', newTotalSeconds.toString());
      localStorage.setItem('argenti_timer_paused_seconds', newTotalSeconds.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const progress = (secondsLeft / totalSeconds) * 100;
  const size = 280; 
  const center = size / 2;
  const strokeWidth = 6; 
  const radius = (size / 2) - (strokeWidth * 3);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full animate-fade-in overflow-hidden">
      {/* 核心内容容器 */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl flex-grow py-8 overflow-y-auto custom-scrollbar">
        
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-2xl text-[#c5a059] mb-3 tracking-widest">{title}</h2>
          <div className="max-w-md mx-auto">
            <p className="text-[#f4e4bc]/70 italic font-playfair px-4 leading-relaxed text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="relative mb-10 flex items-center justify-center w-full max-w-[280px] aspect-square flex-shrink-0">
          {/* Decorative background orbits */}
          <div className="absolute inset-0 -m-6 border border-[#c5a059]/10 rounded-full animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-0 -m-3 border border-[#8b1c1c]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
          
          <div className={`absolute w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[40px] transition-opacity duration-1000 ${isActive ? 'animate-pulse opacity-100' : 'opacity-40'}`} />
          
          <svg 
            viewBox={`0 0 ${size} ${size}`} 
            className="w-full h-full transform -rotate-90 overflow-visible"
          >
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b1c1c" />
                <stop offset="50%" stopColor="#c5a059" />
                <stop offset="100%" stopColor="#8b1c1c" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#151515"
              strokeWidth={strokeWidth - 2}
              fill="transparent"
            />
            
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* 计时器中心显示区域 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-6">
            
            {/* 时间显示/编辑区域 */}
            <div className="relative z-10 pointer-events-auto cursor-pointer group flex items-center justify-center min-w-[220px]">
              {isEditing ? (
                <div className="flex items-center justify-center bg-transparent">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value.replace(/\D/g, ''))}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-40 text-center bg-transparent border-none outline-none text-5xl md:text-6xl font-cinzel text-[#f4e4bc] selection:bg-[#c5a059]/30"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))' }}
                  />
                </div>
              ) : (
                <div 
                  onClick={startEditing}
                  title={isActive ? "运行中不可修改时长" : "点击自定义时长"}
                  className="transition-transform duration-300 active:scale-95"
                >
                  <span className="text-5xl md:text-6xl font-cinzel text-[#f4e4bc] transition-all duration-500" style={{ filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))' }}>
                    {formatTime(secondsLeft)}
                  </span>
                  {!isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2 w-24 relative z-10 opacity-80 group">
              <div className="h-[0.5px] flex-grow bg-gradient-to-r from-transparent to-[#c5a059]/60 shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
              <div className="w-1.5 h-1.5 rotate-45 border border-[#c5a059] bg-[#0a0a0a] shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
              <div className="h-[0.5px] flex-grow bg-gradient-to-l from-transparent to-[#c5a059]/60 shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
            </div>

            <span className={`mt-3 font-cinzel text-[10px] md:text-[11px] tracking-[0.4em] text-[#c5a059] uppercase transition-all duration-1000 ${isActive ? 'animate-pulse opacity-100' : 'opacity-60'}`} style={{ filter: 'drop-shadow(0 0 5px rgba(197, 160, 89, 0.4))' }}>
              {getStatusText()}
            </span>

            {/* 状态玫瑰 */}
            <div className="mt-3 flex items-center justify-center h-8 w-8 bg-transparent">
              <span 
                className={`text-xl leading-none transition-all duration-700 bg-transparent inline-block ${isActive ? 'opacity-90' : 'opacity-40'}`}
                style={{ 
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.6))' : 'none',
                  backgroundColor: 'transparent'
                }}
              >
                {isActive ? '🌹' : '🥀'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full px-4">
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <Button 
              variant="primary" 
              onClick={() => setIsActive(!isActive)}
              disabled={isEditing}
              className="flex items-center gap-3 min-w-[130px] justify-center text-sm tracking-[0.15em] py-3"
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
              {isActive ? '暂停 PAUSE' : '开始 START'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              disabled={isEditing}
              className="flex items-center gap-3 min-w-[130px] justify-center text-sm tracking-[0.15em] py-3 opacity-80 hover:opacity-100"
            >
              <RefreshCw size={16} />
              放弃 SURRENDER
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};

export default TimerView;
