import ImageSplicingTool from "@/components/ImageSplicingTool";
import SocialLinks, { textLinks } from "@/components/SocialLinks";
import SocialDrawer from "@/components/SocialDrawer";
import FloatingSocial from "@/components/FloatingSocial";

const Index = () => {
  return (
    <div className="min-h-screen bg-tool-dark text-white pb-10 relative overflow-hidden">
      {/* 背景发光效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-tool-primary/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-tool-primary/5 blur-[100px] -z-10"></div>

      <header className="border-b border-tool-border/30 bg-black/80 backdrop-blur-md sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-black border-2 border-tool-primary flex items-center justify-center text-tool-primary font-bold relative">
              <span className="absolute inset-0 rounded-full bg-tool-primary/20 animate-pulse"></span>
              <span className="relative">AT</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-tool-primary bg-clip-text text-transparent">Aitrainee图片工具</h1>
          </div>

          {/* 顶部导航链接 */}
          <div className="hidden md:flex items-center space-x-4">
            {textLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-tool-primary transition-colors"
                title={link.extraInfo || link.name}
              >
                {link.name}
                {link.extraInfo && (
                  <span className="ml-1 text-xs text-tool-primary">*</span>
                )}
              </a>
            ))}
          </div>

          <div className="text-sm text-tool-primary/80 font-medium">
            快速图片处理 | 解决公众号图片粘贴问题
          </div>
        </div>
      </header>

      <main className="pt-8">
        <ImageSplicingTool />
      </main>

      <footer className="mt-16 container mx-auto p-4 border-t border-tool-border/20 text-center">
        {/* 社交媒体链接 */}
        <div className="mb-6">
          <h3 className="text-tool-primary mb-3 text-sm font-medium">关注我们</h3>
          <SocialLinks className="mt-2" showTextLinks={false} />
        </div>

        <p className="flex items-center justify-center gap-4 text-gray-500 text-sm mt-6">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+V</kbd> 粘贴图片
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+C</kbd> 复制拼接结果
          </span>
        </p>

        <p className="text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} ATrAINEE. 保留所有权利.
        </p>
      </footer>

      {/* 社交媒体侧边抽屉 */}
      <SocialDrawer />

      {/* 浮动社交媒体快捷入口 */}
      <FloatingSocial />
    </div>
  );
};

export default Index;
