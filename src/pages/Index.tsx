import ImageSplicingTool from "@/components/ImageSplicingTool";

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
              <span className="relative">IT</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-tool-primary bg-clip-text text-transparent">ImagesTool</h1>
          </div>
          <div className="text-sm text-tool-primary/80 font-medium">
            专业图片拼接工具
          </div>
        </div>
      </header>
      
      <main className="pt-8">
        <ImageSplicingTool />
      </main>
      
      <footer className="mt-16 container mx-auto p-4 border-t border-tool-border/20 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+V</kbd> 粘贴图片
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+C</kbd> 复制拼接结果
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Index;
