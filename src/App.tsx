import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

// 使用React.lazy进行懒加载
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 加载指示器组件
const LoadingFallback = () => (
  <div className="min-h-screen bg-tool-dark text-white flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-tool-primary/20 border-t-tool-primary rounded-full animate-spin"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5分钟
    },
  },
});

const App = () => {
  useEffect(() => {
    // 预加载关键资源
    const preloadImages = () => {
      const images = [
        // 可以添加需要预加载的图片路径
      ];
      
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    // 设置页面标题
    document.title = "图片即贴 - 简单高效的图片处理工具";
    
    // 仅在idle时预加载
    if (window.requestIdleCallback) {
      window.requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, 1000);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
