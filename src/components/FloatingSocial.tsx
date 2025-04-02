import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import SocialLinks from './SocialLinks';
import { ChevronUp, X } from 'lucide-react';

interface FloatingSocialProps {
    className?: string;
}

const FloatingSocial: React.FC<FloatingSocialProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={cn("fixed bottom-6 right-6 z-40 flex flex-col items-end", className)}>
            {/* 展开的社交媒体菜单 */}
            {isOpen && (
                <div className="mb-3 bg-black/80 backdrop-blur-md border border-tool-border/30 p-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-tool-primary/80">关注我们</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-tool-primary"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <SocialLinks showTextLinks={false} />
                    </div>
                </div>
            )}

            {/* 切换按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border transition-all",
                    "bg-black/80 backdrop-blur-md shadow-lg",
                    isOpen
                        ? "border-tool-primary text-tool-primary"
                        : "border-tool-border/30 text-gray-400 hover:text-tool-primary hover:border-tool-primary/50"
                )}
            >
                <ChevronUp
                    size={20}
                    className={cn(
                        "transition-transform duration-300",
                        isOpen ? "rotate-0" : "rotate-180"
                    )}
                />
            </button>
        </div>
    );
};

export default FloatingSocial; 