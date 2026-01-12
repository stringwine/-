
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
  // --- 初始化状态 ---
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
    return durationMinutes * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    return !!localStorage.getItem('argenti_timer_target');
  });
  
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
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isActive) return "FOCUSING";
    if (secondsLeft < durationMinutes * 60) return "PAUSED";
    return "WAITING";
  };

  const progress = (secondsLeft / (durationMinutes * 60)) * 100;
  const size = 280; 
  const center = size / 2;
  const strokeWidth = 6; 
  const radius = (size / 2) - (strokeWidth * 3);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-start md:justify-center p-4 w-full max-w-2xl mx-auto h-full overflow-y-auto overflow-x-hidden animate-fade-in custom-scrollbar">
      <div className="text-center mb-6 mt-2">
        <h2 className="font-cinzel text-2xl text-[#c5a059] mb-2 tracking-widest">{title}</h2>
        <div className="max-w-md mx-auto">
          <p className="text-[#f4e4bc]/70 italic font-playfair px-4 leading-relaxed text-xs md:text-sm">{description}</p>
        </div>
      </div>

      <div className="relative mb-6 flex items-center justify-center w-full max-w-[280px] aspect-square">
        {/* Decorative background orbits */}
        <div className="absolute inset-0 -m-6 border border-[#c5a059]/10 rounded-full animate-[spin_40s_linear_infinite]" />
        <div className="absolute inset-0 -m-3 border border-[#8b1c1c]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
        
        {/* Central Pulsing Glow Background */}
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
            <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#151515"
            strokeWidth={strokeWidth - 2}
            fill="transparent"
          />
          
          {/* Progress circle with Gradient and Glow */}
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

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Main Time with Outer Glow */}
          <span className="text-5xl md:text-6xl font-cinzel text-[#f4e4bc] relative z-10 transition-all duration-500" style={{ filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.5))' }}>
            {formatTime(secondsLeft)}
          </span>
          
          {/* Decorative Ornament with Glow */}
          <div className="flex items-center gap-2 mt-2 w-24 relative z-10 opacity-80 group">
            <div className="h-[0.5px] flex-grow bg-gradient-to-r from-transparent to-[#c5a059]/60 shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#c5a059] bg-[#0a0a0a] shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
            <div className="h-[0.5px] flex-grow bg-gradient-to-l from-transparent to-[#c5a059]/60 shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
          </div>

          {/* Status Text with breathing effect */}
          <span className={`mt-3 font-cinzel text-[10px] md:text-[11px] tracking-[0.4em] text-[#c5a059] uppercase transition-all duration-1000 ${isActive ? 'animate-pulse opacity-100' : 'opacity-60'}`} style={{ filter: 'drop-shadow(0 0 5px rgba(197, 160, 89, 0.4))' }}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full mb-8">
        <div className="flex flex-wrap justify-center gap-3 w-full">
          <Button 
            variant="primary" 
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-3 min-w-[130px] justify-center text-sm tracking-[0.15em] py-2.5"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? '暂停 PAUSE' : '开始 START'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            className="flex items-center gap-3 min-w-[130px] justify-center text-sm tracking-[0.15em] py-2.5 opacity-80 hover:opacity-100"
          >
            <RefreshCw size={16} />
            放弃 SURRENDER
          </Button>
        </div>
      </div>

      <div className="mt-auto pb-4 opacity-30">
        <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]">🥀</span>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        @keyframes central-breathing {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default TimerView;
