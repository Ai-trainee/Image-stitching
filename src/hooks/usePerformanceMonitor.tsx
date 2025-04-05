import { useRef, useEffect } from 'react';
import { measurePerformance } from '@/lib/utils';

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  warnThreshold?: number; // 毫秒
  reportInterval?: number; // 毫秒
}

/**
 * 自定义Hook，用于监控组件渲染性能
 * 
 * @example
 * ```tsx
 * // 在组件中使用
 * const MyComponent = () => {
 *   usePerformanceMonitor({ componentName: 'MyComponent' });
 *   
 *   // 组件代码
 *   return <div>...</div>;
 * }
 * ```
 */
export default function usePerformanceMonitor({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  warnThreshold = 16, // 16ms约等于一帧的时间
  reportInterval = 10000, // 10秒
}: UsePerformanceMonitorOptions): void {
  // 只在开发模式或明确启用时监控性能
  if (!enabled) return;

  const renderStartTime = useRef(performance.now());
  const updateCount = useRef(0);
  const lastReportTime = useRef(0);
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    updateCount: 0,
  });

  // 将当前性能指标保存到ref
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    // 增加更新计数
    updateCount.current += 1;
    
    // 更新指标
    metricsRef.current = {
      renderTime,
      updateCount: updateCount.current,
    };
    
    // 如果渲染时间超过阈值，记录警告
    if (renderTime > warnThreshold) {
      console.warn(
        `[性能警告] ${componentName} 渲染耗时: ${renderTime.toFixed(2)}ms (超过 ${warnThreshold}ms 阈值)`
      );
    }
    
    // 为下一次渲染设置开始时间
    renderStartTime.current = performance.now();
  });
  
  // 定期报告性能指标
  useEffect(() => {
    const reportMetrics = () => {
      const now = performance.now();
      const timeSinceLastReport = now - lastReportTime.current;
      
      // 只有在距离上次报告超过设定间隔时才报告
      if (timeSinceLastReport >= reportInterval) {
        console.info(
          `[性能监控] ${componentName}:\n` +
          `- 渲染次数: ${metricsRef.current.updateCount}\n` +
          `- 上次渲染时间: ${metricsRef.current.renderTime.toFixed(2)}ms\n` +
          `- 平均渲染间隔: ${(timeSinceLastReport / updateCount.current).toFixed(2)}ms`
        );
        
        // 重置计数
        updateCount.current = 0;
        lastReportTime.current = now;
      }
    };
    
    // 设置定期报告
    const intervalId = setInterval(reportMetrics, reportInterval);
    
    // 清理
    return () => {
      clearInterval(intervalId);
    };
  }, [componentName, reportInterval]);
  
  // 组件卸载时报告最终指标
  useEffect(() => {
    return () => {
      console.info(
        `[性能监控] ${componentName} 卸载:\n` +
        `- 总渲染次数: ${updateCount.current}\n` +
        `- 最后渲染时间: ${metricsRef.current.renderTime.toFixed(2)}ms`
      );
    };
  }, [componentName]);
} 