import ImageSplicingTool from "@/components/ImageSplicingTool";
import SocialLinks, { textLinks } from "@/components/SocialLinks";
import SocialDrawer from "@/components/SocialDrawer";
import FloatingSocial from "@/components/FloatingSocial";

const Index = () => {
  return (
    <div className="min-h-screen bg-tool-dark text-white pb-10 relative overflow-hidden">
      {/* 背景发光效果 - 减弱 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-tool-primary/3 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-tool-primary/3 blur-[100px] -z-10"></div>
      
      <header className="border-b border-tool-border/30 bg-black/80 backdrop-blur-md sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-black border-2 border-tool-primary flex items-center justify-center text-tool-primary font-bold relative">
              <span className="absolute inset-0 rounded-full bg-tool-primary/20 animate-pulse"></span>
              <span className="relative">图</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-tool-primary bg-clip-text text-transparent">图片即贴</h1>
          </div>
          
          {/* 精简过的顶部导航链接 */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-tool-primary font-medium px-2 py-1 bg-tool-primary/10 rounded">公众号图片处理神器</span>
            <a 
              href="#features"
              className="text-sm text-gray-300 hover:text-tool-primary transition-colors"
            >
              为什么需要它？
            </a>
            {textLinks.slice(0, 2).map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-tool-primary transition-colors"
                title={link.extraInfo || link.name}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </header>
      
      <main className="pt-4">
        {/* 工具简介 */}
        <div className="container mx-auto px-4 mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">一键解决公众号图片痛点</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            复制任意图片 → 粘贴到这里 → 复制结果 → 直接用于公众号，解决海外图片无法显示问题
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 bg-tool-primary/10 px-3 py-1.5 rounded">
              <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+V</kbd> 
              <span className="text-sm">粘贴图片</span>
            </div>
            <div className="flex items-center gap-1 bg-tool-primary/10 px-3 py-1.5 rounded">
              <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+C</kbd> 
              <span className="text-sm">复制结果</span>
            </div>
          </div>
        </div>
        
        {/* 主工具区域 */}
        <ImageSplicingTool />
        
        {/* 功能说明 */}
        <div id="features" className="container mx-auto px-4 mt-16">
          <h3 className="text-xl font-bold text-white mb-6 text-center">为什么需要图片即贴？</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 p-5 rounded-lg border border-tool-border/30">
              <h4 className="text-lg font-medium text-tool-primary mb-2">海外图片兼容</h4>
              <p className="text-gray-400 text-sm">解决海外平台图片粘贴到公众号失效的问题，确保你的内容完整呈现</p>
            </div>
            <div className="bg-black/40 p-5 rounded-lg border border-tool-border/30">
              <h4 className="text-lg font-medium text-tool-primary mb-2">超快工作流</h4>
              <p className="text-gray-400 text-sm">简单的复制-粘贴-复制结果流程，专为高效内容创作设计</p>
            </div>
            <div className="bg-black/40 p-5 rounded-lg border border-tool-border/30">
              <h4 className="text-lg font-medium text-tool-primary mb-2">无需下载上传</h4>
              <p className="text-gray-400 text-sm">告别繁琐的图片下载-上传流程，直接复制结果到公众号编辑器</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-16 container mx-auto p-4 border-t border-tool-border/20 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-tool-primary text-sm font-medium mb-3">关于我们</h4>
            <p className="text-gray-400 text-sm">我们专注于为内容创作者提供高效实用的工具，解决实际工作中的痛点问题</p>
          </div>
          <div>
            <h4 className="text-tool-primary text-sm font-medium mb-3">相关资源</h4>
            <div className="flex flex-col gap-2">
              {textLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-tool-primary transition-colors"
                >
                  {link.name}
                  {link.extraInfo && (
                    <span className="ml-1 text-xs text-tool-primary">*</span>
                  )}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-tool-primary text-sm font-medium mb-3">关注我们</h4>
            <SocialLinks className="justify-center md:justify-start" showTextLinks={false} />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-tool-border/10">
          © {new Date().getFullYear()} ATrAINEE. 保留所有权利.
        </p>
      </footer>
      
      {/* 浮动社交媒体快捷入口 - 保留但简化 */}
      <FloatingSocial />
    </div>
  );
};

export default Index;
