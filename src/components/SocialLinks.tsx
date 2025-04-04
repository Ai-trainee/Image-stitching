import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// 弹窗组件
interface PopupProps {
    title: string;
    image: string;
    description?: string;
    link?: string;
    code?: string;
    onClose: () => void;
}

const QRPopup: React.FC<PopupProps> = ({ title, image, description, link, code, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
            <div
                className="relative bg-black/90 border border-tool-border rounded-lg p-6 shadow-lg w-72 max-w-full animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-tool-primary transition-colors"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <h3 className="text-tool-primary text-center font-medium text-lg mb-4">{title}</h3>

                <div className="bg-black p-2 rounded border border-tool-border/40 mb-4">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-auto rounded"
                    />
                </div>

                {description && (
                    <p className="text-gray-300 text-sm mb-4 text-center">{description}</p>
                )}

                {link && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-1">链接地址:</p>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={link}
                                readOnly
                                className="w-full bg-black/60 border border-tool-border/40 rounded px-2 py-1.5 text-xs text-tool-primary overflow-hidden"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(link);
                                    alert('已复制链接');
                                }}
                                className="ml-2 text-tool-primary hover:bg-tool-primary/10 p-1.5 rounded"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {code && (
                    <div>
                        <p className="text-xs text-gray-400 mb-1">优惠码:</p>
                        <div className="bg-tool-primary/10 border border-tool-primary/40 rounded px-3 py-2 text-center">
                            <span className="text-tool-primary font-medium">{code}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 将文字链接和图标链接分开定义
const textLinks = [
    {
        name: '知识星球',
        url: 'https://t.zsxq.com/DoCG3',
    },
    {
        name: '订阅频道',
        url: 'https://mp.weixin.qq.com/mp/homepage?__biz=MzkyMzY1NTM0Mw==&hid=7&sn=32ac1cb76efc18c9c1851019ed294d64&scene=18#wechat_redirect'
    },
    {
        name: 'AI资源库',
        url: 'https://pan.quark.cn/s/559a8707b1ab'
    },
    {
        name: 'AI账号升级',
        url: 'https://nf.video/DEBjE',
        extraInfo: '优惠码: Aitrainee'
    },
    {
        name: 'Cursor云开发',
        url: 'https://cloud.sealos.run/?uid=YSgbXmiema',
        onClick: null  // 移除onClick事件
    }
];

const iconLinks = [
    {
        name: '公众号',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M9.5,4C5.36,4 2,6.69 2,10C2,11.89 3.08,13.56 4.78,14.66L4,17L6.5,15.5C7.39,15.81 8.37,16 9.41,16C9.15,15.37 9,14.7 9,14C9,10.69 12.13,8 16,8C16.19,8 16.38,8 16.56,8.03C15.54,5.69 12.78,4 9.5,4M6.5,6.5A1,1 0 0,1 7.5,7.5A1,1 0 0,1 6.5,8.5A1,1 0 0,1 5.5,7.5A1,1 0 0,1 6.5,6.5M11.5,6.5A1,1 0 0,1 12.5,7.5A1,1 0 0,1 11.5,8.5A1,1 0 0,1 10.5,7.5A1,1 0 0,1 11.5,6.5M16,9C13.24,9 11,11.24 11,14C11,16.76 13.24,19 16,19C16.67,19 17.31,18.85 17.88,18.58L20,20L19.23,17.88C20.32,16.92 21,15.54 21,14C21,11.24 18.76,9 16,9M14,11.5A1,1 0 0,1 15,12.5A1,1 0 0,1 14,13.5A1,1 0 0,1 13,12.5A1,1 0 0,1 14,11.5M18,11.5A1,1 0 0,1 19,12.5A1,1 0 0,1 18,13.5A1,1 0 0,1 17,12.5A1,1 0 0,1 18,11.5Z" />
            </svg>
        ),
        url: 'https://mp.weixin.qq.com/s/eo5Ke_Plu_CBtlP6Fsn5tA',
        onClick: () => true // 这将在SocialLinks组件中被替换
    },
    {
        name: 'X',
        url: 'https://x.com/aitraineeg1',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        )
    },
    {
        name: 'B站',
        url: 'https://space.bilibili.com/496170957',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.25.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.25.56-.373.933-.373z" />
            </svg>
        )
    },
    {
        name: 'YouTube',
        url: 'https://www.youtube.com/@Aitraineegpt/videos',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
        )
    },
    {
        name: '小红书',
        url: 'https://www.xiaohongshu.com/user/profile/5e17f76e000000000100017f',
        icon: (
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="w-5 h-5">
                <path d="M802.304 242.368a246.4 246.4 0 0 0-103.424-104.32c-41.6-21.44-88.704-32.96-137.984-32.96H468.16c-49.28 0-96.384 11.52-138.048 32.96a246.4 246.4 0 0 0-103.36 104.32c-21.952 42.24-33.6 89.856-33.6 139.584v264.96c0 49.728 11.648 97.28 33.6 139.584a246.4 246.4 0 0 0 103.36 104.32c41.664 21.44 88.768 32.96 138.048 32.96h92.736c49.28 0 96.384-11.52 137.984-32.96a246.4 246.4 0 0 0 103.424-104.32c21.952-42.304 33.6-89.92 33.6-139.584v-264.96c0-49.728-11.648-97.408-33.6-139.584m-178.88 404.288c-33.472 35.072-79.552 54.016-129.344 53.44h-0.64c-49.28 0-95.36-18.368-129.28-51.84-33.536-33.984-52.032-78.912-52.032-126.464v-4.8c0-48 18.56-93.504 52.032-127.36 33.92-33.408 80.064-51.84 129.28-51.84h0.64c49.792-0.64 95.872 18.304 129.344 53.44 16.96 17.792 30.272 38.592 39.552 61.76 9.344 23.744 14.336 48.96 14.336 75.2v4.8c0 49.28-19.456 95.68-53.888 129.664" />
                <path d="M573.12 543.232L512 508.16l-61.12 35.072V416.96L512 381.888l61.12 35.072v126.272z" fill="#00E6E6" />
            </svg>
        )
    },
    {
        name: '抖音',
        url: 'https://www.douyin.com/user/self?from_tab_name=main',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.932c-.486-.497-.861-1.055-1.109-1.701-.291-.755-.356-1.527-.346-2.32.006-.055.006-.104.006-.155H12.58v12.767c0 .21-.001.421 0 .631-.006.471-.088.941-.305 1.367-.278.547-.748.997-1.322 1.255-.574.26-1.241.312-1.862.18a3.086 3.086 0 0 1-1.608-.917 3.107 3.107 0 0 1-.679-1.833c-.034-.578.074-1.162.32-1.68.26-.538.665-.994 1.185-1.307.548-.328 1.193-.487 1.84-.46.038 0 .071.006.11.006V6.99c-.039 0-.078-.006-.115-.006a9.308 9.308 0 0 0-2.092.232 8.14 8.14 0 0 0-1.919.683 7.958 7.958 0 0 0-2.647 2.058c-.7.865-1.224 1.888-1.519 2.978a9.235 9.235 0 0 0-.289 1.984c-.028.576 0 1.158.084 1.733a8.846 8.846 0 0 0 1.003 3.12c.534.999 1.261 1.882 2.154 2.568.894.688 1.931 1.166 3.015 1.398.91.194 1.852.21 2.78.074a8.928 8.928 0 0 0 2.37-.64c.569-.24 1.109-.544 1.608-.914a8.62 8.62 0 0 0 1.812-1.69 8.92 8.92 0 0 0 1.366-2.19 8.587 8.587 0 0 0 .652-2.444c.091-.64.096-1.283.098-1.924V9.045c.018 0 .033.006.055.006.336.07.7.094 1.043.077a6.992 6.992 0 0 0 1.498-.252 7.09 7.09 0 0 0 1.687-.707c.132-.077.264-.16.39-.243v-2.358c-.059.017-.087.033-.115.044-.293.108-.587.209-.88.293-.363.106-.727.2-1.096.265-.42.077-.852.126-1.279.143-.396.017-.786.006-1.174-.028-.375-.034-.743-.094-1.113-.16-.088-.016-.176-.034-.266-.05Z" />
            </svg>
        )
    }
];

// 暴露文字链接，方便在导航栏中使用
export { textLinks };

const SocialLinks: React.FC<{
    className?: string,
    variant?: 'horizontal' | 'vertical',
    showTextLinks?: boolean // 控制是否显示文字链接
}> = ({
    className,
    variant = 'horizontal',
    showTextLinks = true
}) => {
        const [activePopup, setActivePopup] = useState<string | null>(null);

        // 添加标志来跟踪公众号链接点击后的状态
        const [mpLinkClicked, setMpLinkClicked] = useState(false);

        // 监听公众号链接点击后自动弹出二维码
        useEffect(() => {
            if (mpLinkClicked) {
                setActivePopup('mp');
                setMpLinkClicked(false);
            }
        }, [mpLinkClicked]);

        // 处理公众号点击事件
        const updatedIconLinks = iconLinks.map(link => {
            if (link.name === '公众号') {
                return {
                    ...link,
                    onClick: () => setMpLinkClicked(true)
                };
            }
            return link;
        });

        return (
            <div className={cn("transition-all duration-300", className)}>
                {/* 社交媒体链接 */}
                <div className={cn(
                    "flex gap-3",
                    variant === 'vertical' ? "flex-col" : "flex-wrap justify-center"
                )}>
                    {/* 有条件地渲染文字链接 */}
                    {showTextLinks && textLinks.map((social) => (
                        <div key={social.name} className="relative group">
                            <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-400 hover:text-tool-primary transition-colors"
                                title={social.extraInfo || social.name}
                                onClick={social.onClick !== null ? social.onClick : undefined}
                            >
                                <div className="min-w-[32px] h-8 px-2 rounded-full bg-black border border-tool-border/40 flex items-center justify-center hover:border-tool-primary hover:bg-tool-primary/5 transition-all duration-300">
                                    <div className="text-tool-primary text-xs">{social.name}</div>
                                </div>
                                {variant === 'vertical' && <span className="text-sm">{social.name}</span>}
                                {social.extraInfo && variant === 'vertical' && (
                                    <span className="text-xs text-tool-primary">{social.extraInfo}</span>
                                )}
                            </a>
                        </div>
                    ))}

                    {/* 图标链接 */}
                    {updatedIconLinks.map((social) => (
                        <div key={social.name} className="relative group">
                            <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-400 hover:text-tool-primary transition-colors"
                                title={social.name}
                                onClick={social.onClick !== null ? social.onClick : undefined}
                            >
                                <div className="w-8 h-8 rounded-full bg-black border border-tool-border/40 flex items-center justify-center hover:border-tool-primary hover:bg-tool-primary/5 transition-all duration-300">
                                    <div className="text-tool-primary">{social.icon}</div>
                                </div>
                                {variant === 'vertical' && <span className="text-sm">{social.name}</span>}
                            </a>
                        </div>
                    ))}
                </div>

                {/* 公众号弹窗 */}
                {activePopup === 'mp' && (
                    <QRPopup
                        title="ATrAINEE公众号"
                        image="/images/mp.svg"
                        description="扫码关注公众号，获取最新AI资讯"
                        link="https://mp.weixin.qq.com/s/eo5Ke_Plu_CBtlP6Fsn5tA"
                        onClose={() => setActivePopup(null)}
                    />
                )}
            </div>
        );
    };

export default SocialLinks; 