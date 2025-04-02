import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, X } from 'lucide-react';

interface FloatingSocialProps {
    className?: string;
}

const FloatingSocial: React.FC<FloatingSocialProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showQrCode, setShowQrCode] = useState(false);

    const toggleQrCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowQrCode(!showQrCode);
    };

    return (
        <div className={cn("fixed bottom-6 right-6 z-40 flex flex-col items-end", className)}>
            {/* QR码弹窗 */}
            {showQrCode && (
                <div className="absolute bottom-16 right-0 bg-black/90 border border-tool-border/50 rounded-lg p-4 shadow-lg mb-2 w-56 transition-all duration-300 animate-in fade-in scale-in-95 slide-in-from-bottom-2">
                    <button
                        onClick={toggleQrCode}
                        className="absolute top-2 right-2 text-gray-400 hover:text-tool-primary"
                    >
                        <X size={16} />
                    </button>
                    <div className="text-center">
                        <h3 className="text-tool-primary text-sm font-medium mb-2">关注公众号</h3>
                        <img
                            src="/qrcode.svg"
                            alt="公众号二维码"
                            className="w-full h-auto rounded border border-tool-border/40 mb-2"
                        />
                        <p className="text-xs text-gray-400">扫描关注获取更多AI资讯</p>
                    </div>
                </div>
            )}

            {/* 展开的社交媒体菜单 */}
            {isOpen && (
                <div className="mb-3 bg-black/80 backdrop-blur-md border border-tool-border/30 rounded-lg p-3 shadow-lg transition-all duration-300 animate-in fade-in scale-in-95">
                    <div className="flex flex-col space-y-3">
                        <a
                            href="https://t.zsxq.com/DoCG3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-300 hover:text-tool-primary transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/60 border border-tool-border/40 flex items-center justify-center text-tool-primary">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M9.75,7.82C10.62,7.82 11.45,8.23 11.87,8.87L12,9.06L12.13,8.87C12.55,8.23 13.38,7.82 14.25,7.82C15.79,7.82 17,9.03 17,10.57C17,12.46 15.3,14 12.83,16.19L12,16.92L11.17,16.19C8.7,14 7,12.46 7,10.57C7,9.03 8.21,7.82 9.75,7.82Z" />
                                </svg>
                            </div>
                            <span className="text-sm">知识星球</span>
                        </a>

                        <button
                            onClick={toggleQrCode}
                            className="flex items-center gap-2 text-gray-300 hover:text-tool-primary transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/60 border border-tool-border/40 flex items-center justify-center text-tool-primary">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M9.5,4C5.36,4 2,6.69 2,10C2,11.89 3.08,13.56 4.78,14.66L4,17L6.5,15.5C7.39,15.81 8.37,16 9.41,16C9.15,15.37 9,14.7 9,14C9,10.69 12.13,8 16,8C16.19,8 16.38,8 16.56,8.03C15.54,5.69 12.78,4 9.5,4M6.5,6.5A1,1 0 0,1 7.5,7.5A1,1 0 0,1 6.5,8.5A1,1 0 0,1 5.5,7.5A1,1 0 0,1 6.5,6.5M11.5,6.5A1,1 0 0,1 12.5,7.5A1,1 0 0,1 11.5,8.5A1,1 0 0,1 10.5,7.5A1,1 0 0,1 11.5,6.5M16,9C13.24,9 11,11.24 11,14C11,16.76 13.24,19 16,19C16.67,19 17.31,18.85 17.88,18.58L20,20L19.23,17.88C20.32,16.92 21,15.54 21,14C21,11.24 18.76,9 16,9M14,11.5A1,1 0 0,1 15,12.5A1,1 0 0,1 14,13.5A1,1 0 0,1 13,12.5A1,1 0 0,1 14,11.5M18,11.5A1,1 0 0,1 19,12.5A1,1 0 0,1 18,13.5A1,1 0 0,1 17,12.5A1,1 0 0,1 18,11.5Z" />
                                </svg>
                            </div>
                            <span className="text-sm">公众号</span>
                        </button>

                        <a
                            href="https://space.bilibili.com/496170957"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-300 hover:text-tool-primary transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/60 border border-tool-border/40 flex items-center justify-center text-tool-primary">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.25.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.25.56-.373.933-.373z" />
                                </svg>
                            </div>
                            <span className="text-sm">哔哩哔哩</span>
                        </a>
                    </div>
                </div>
            )}

            {/* 主按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 rounded-full bg-black flex items-center justify-center border transform transition-all duration-300",
                    isOpen
                        ? "border-tool-primary text-tool-primary bg-tool-primary/10 rotate-0"
                        : "border-tool-border/40 text-gray-300 hover:text-tool-primary hover:border-tool-primary hover:bg-tool-primary/5 rotate-0",
                    "shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,230,230,0.2)]"
                )}
            >
                {isOpen ? (
                    <X size={22} className="animate-in fade-in zoom-in duration-300" />
                ) : (
                    <Users size={22} className="animate-in fade-in zoom-in duration-300" />
                )}
            </button>

            {/* 发光效果 */}
            {isOpen && (
                <div className="absolute inset-0 -z-10 bg-tool-primary/5 blur-xl rounded-full"></div>
            )}
        </div>
    );
};

export default FloatingSocial; 