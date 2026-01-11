
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
  const baseStyles = "px-6 py-2 rounded-full font-cinzel transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variants = {
    primary: "bg-[#8b1c1c] text-[#f4e4bc] border-[#c5a059] shadow-[0_0_15px_rgba(139,28,28,0.4)] hover:shadow-[0_0_20px_rgba(139,28,28,0.6)]",
    secondary: "bg-[#2a2a2a] text-[#f4e4bc] border-[#4a4a4a] hover:bg-[#3a3a3a]",
    outline: "bg-transparent text-[#c5a059] border-[#c5a059] hover:bg-[#c5a059] hover:text-[#0a0a0a]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
