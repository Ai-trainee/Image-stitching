import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 应用版本，用于错误跟踪和日志
export const APP_VERSION = '1.0.0';

// 错误上报接口
interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  version: string;
  context?: Record<string, any>;
  type: 'error' | 'warning' | 'info';
}

// 在生产环境中实际上会将错误发送到服务器
// 这里简化为控制台日志记录
export function reportError(error: Error, context?: Record<string, any>): void {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    context,
    type: 'error'
  };
  
  // 开发环境直接输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorReport);
    return;
  }
  
  // 生产环境可以发送到监控服务
  try {
    // 实际项目中这里应调用错误上报API
    // 例如: fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) })
    
    // 暂时只记录到控制台
    console.error('[Error Report]', errorReport);
    
    // 也可以使用localStorage存储少量日志，便于排查
    const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
    logs.push({
      message: error.message,
      timestamp: errorReport.timestamp,
      type: 'error'
    });
    
    // 只保留最近的20条记录
    if (logs.length > 20) {
      logs.shift();
    }
    
    localStorage.setItem('app_error_logs', JSON.stringify(logs));
  } catch (e) {
    // 避免错误上报本身出错导致循环
    console.error('Failed to report error:', e);
  }
}

// 性能监控工具
export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    
    // 记录过长的操作
    if (duration > 50) { // 50ms阈值可以调整
      console.warn(`[Performance] ${label} took ${duration.toFixed(2)}ms`);
      
      // 对于特别耗时的操作可以记录下来
      if (duration > 500) {
        const perfLogs = JSON.parse(localStorage.getItem('app_perf_logs') || '[]');
        perfLogs.push({
          label,
          duration,
          timestamp: new Date().toISOString()
        });
        
        // 只保留最近的20条
        if (perfLogs.length > 20) {
          perfLogs.shift();
        }
        
        localStorage.setItem('app_perf_logs', JSON.stringify(perfLogs));
      }
    }
  }
}

// 安全地解析JSON，避免抛出异常
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    reportError(e as Error, { context: 'safeParseJSON', input: json.substring(0, 100) });
    return fallback;
  }
}

// 防抖函数，可以在组件外使用
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

// 节流函数，限制函数调用频率
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= ms) {
          fn.apply(this, args);
          lastRan = Date.now();
        }
      }, ms - (Date.now() - lastRan));
    }
  };
}

// 内存使用监控
export function monitorMemoryUsage(): void {
  if (!performance || !('memory' in performance)) {
    return;
  }
  
  // 类型断言，因为TypeScript不能识别performance.memory
  const memory = (performance as any).memory;
  
  if (memory) {
    const usage = {
      totalJSHeapSize: memory.totalJSHeapSize / 1048576, // MB
      usedJSHeapSize: memory.usedJSHeapSize / 1048576, // MB
      jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576, // MB
      timestamp: new Date().toISOString()
    };
    
    // 内存使用超过一定阈值时记录
    if (usage.usedJSHeapSize > usage.jsHeapSizeLimit * 0.7) {
      console.warn('[Memory] High memory usage:', usage);
      
      // 可以在这里执行一些清理操作，如清除缓存等
    }
    
    return usage;
  }
}
