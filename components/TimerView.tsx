
import React, { useState, useEffect } from 'react';
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
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (secondsLeft / (durationMinutes * 60)) * 100;
  // Size constants for the SVG
  const size = 340; // Slightly larger base size
  const center = size / 2;
  const strokeWidth = 8;
  const radius = (size / 2) - (strokeWidth * 3); // More padding to ensure no clipping
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-start md:justify-center p-6 w-full max-w-2xl mx-auto h-full overflow-y-auto animate-fade-in custom-scrollbar">
      <div className="text-center mb-8 mt-4">
        <h2 className="font-cinzel text-3xl text-[#c5a059] mb-3 tracking-widest">{title}</h2>
        <div className="max-w-md mx-auto">
          <p className="text-[#f4e4bc]/80 italic font-playfair px-4 leading-relaxed text-sm md:text-base">{description}</p>
        </div>
      </div>

      <div className="relative mb-8 flex items-center justify-center w-full max-w-[340px] aspect-square">
        {/* Decorative Outer Rings */}
        <div className="absolute inset-0 -m-8 border border-[#c5a059]/10 rounded-full animate-[spin_40s_linear_infinite]" />
        <div className="absolute inset-0 -m-4 border border-[#8b1c1c]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
        
        {/* Fixed Responsive SVG with extra padding */}
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full transform -rotate-90 overflow-visible drop-shadow-[0_0_20px_rgba(139,28,28,0.3)]"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth - 2}
            fill="transparent"
            className="text-[#151515]"
          />
          {/* Progress Path */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-[#8b1c1c] transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Central Text Panel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-6xl md:text-7xl font-cinzel text-[#f4e4bc] drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full mb-12">
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <Button 
            variant="primary" 
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-3 min-w-[150px] justify-center text-sm tracking-widest py-3 uppercase"
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
            {isActive ? '暂停 Pause' : '开始 Start'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onCancel}
            className="flex items-center gap-3 min-w-[150px] justify-center text-sm tracking-widest py-3 opacity-80 hover:opacity-100 uppercase"
          >
            <RefreshCw size={18} />
            放弃 Surrender
          </Button>
        </div>
      </div>

      {/* Aesthetic Footer Decor */}
      <div className="mt-auto pb-4 opacity-30 flex gap-6 items-center">
        <div className="w-12 h-[1px] bg-gradient-to-l from-[#c5a059] to-transparent" />
        <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]">🥀</span>
        <div className="w-12 h-[1px] bg-gradient-to-r from-[#c5a059] to-transparent" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
};

export default TimerView;
