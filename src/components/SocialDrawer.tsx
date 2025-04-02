import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import SocialLinks from './SocialLinks';
import { ChevronRight } from 'lucide-react';

const SocialDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={cn(
        "fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-start transition-all duration-300",
        isOpen ? "translate-x-0" : "translate-x-[-100px]"
      )}
    >
      {/* 抽屉内容 */}
      <div 
        className={cn(
          "bg-black/80 backdrop-blur-md border-r border-y border-tool-border/30 p-4 rounded-r-lg shadow-[0_0_15px_rgba(0,0,0,0.4)]",
          "transition-all duration-300 h-auto max-h-[400px] overflow-y-auto",
          isOpen ? "w-[130px]" : "w-[60px]"
        )}
      >
        <div className="mb-3">
          <h3 className="text-tool-primary text-sm font-medium mb-3">关注我们</h3>
          <SocialLinks variant="vertical" />
        </div>
      </div>

      {/* 控制按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-0 -translate-y-1/2 translate-x-full bg-black/80 backdrop-blur-md border border-tool-border/30 rounded-r-full p-1 text-tool-primary hover:bg-tool-primary/10 transition-all"
      >
        <ChevronRight 
          size={20}
          className={cn(
            "transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* 发光效果 */}
      <div className="absolute inset-0 -z-10 bg-tool-primary/5 blur-lg opacity-70"></div>
    </div>
  );
};

export default SocialDrawer; 