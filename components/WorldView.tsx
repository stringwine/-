
import React from 'react';
import { WORLD_DATA } from '../constants';
import Button from './Button';
import { Scroll, Users, Map } from 'lucide-react';

interface WorldViewProps {
  onBack: () => void;
}

const WorldView: React.FC<WorldViewProps> = ({ onBack }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-8 border-b border-[#c5a059]/30 pb-4">
        <h1 className="font-cinzel text-4xl text-[#c5a059]">秘密档案 Archives</h1>
        <Button onClick={onBack} variant="outline">返回 Return</Button>
      </div>

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

      <section className="mb-12 opacity-50">
        <div className="flex items-center gap-3 mb-4 text-[#c5a059]">
          <Scroll size={24} />
          <h2 className="font-cinzel text-2xl uppercase tracking-widest">尘封记忆 Locked Memories</h2>
        </div>
        <div className="border-2 border-dashed border-[#c5a059]/20 p-12 text-center rounded-lg">
          <p className="italic font-playfair">继续投入专注，解锁更多关于鲜血与寒铁的深层记录。 Focus more to unlock deeper records.</p>
        </div>
      </section>
    </div>
  );
};

export default WorldView;
