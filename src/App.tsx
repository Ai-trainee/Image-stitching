import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { reportError, monitorMemoryUsage } from "@/lib/utils";

// 使用React.lazy进行懒加载
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 加载指示器组件
const LoadingFallback = () => (
  <div className="min-h-screen bg-tool-dark text-white flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-tool-primary/20 border-t-tool-primary rounded-full animate-spin"></div>
  </div>
);

// 创建带有默认配置的QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5分钟
      retry: 1, // 失败时只重试一次
      onError: (err) => {
        reportError(err instanceof Error ? err : new Error(String(err)), { 
          source: 'react-query' 
        });
      },
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

    // 设置全局错误处理
    const handleGlobalError = (event: ErrorEvent) => {
      reportError(event.error || new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      // 不阻止默认处理
      return false;
    };

    // 捕获未处理的Promise异常
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      reportError(error, { source: 'unhandledRejection' });
    };

    // 定期检查内存使用情况
    const memoryMonitorId = setInterval(() => {
      monitorMemoryUsage();
    }, 30000); // 每30秒检查一次

    // 添加事件监听器
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 清理函数
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(memoryMonitorId);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ErrorBoundary 
                      onError={(error) => {
                        console.error("Index page error:", error);
                        // 可以在这里添加特定的错误处理逻辑
                      }}
                    >
                      <Index />
                    </ErrorBoundary>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
