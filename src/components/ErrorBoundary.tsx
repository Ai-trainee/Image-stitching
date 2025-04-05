import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件，捕获子组件树中的 JavaScript 错误，并显示备用 UI
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  // 当子组件抛出错误时调用
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // 记录错误信息
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录到错误上报服务
    reportError(error, { componentStack: errorInfo.componentStack });
    
    // 调用可选的错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // 重置错误状态
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    // 如果发生错误，显示自定义错误UI
    if (this.state.hasError) {
      // 使用传入的自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-500 mb-2">
            出错了
          </h3>
          <p className="text-sm text-gray-300 mb-4 max-w-md">
            应用遇到了一个问题。我们已记录此错误并将尽快修复。
          </p>
          <div className="space-x-3">
            <Button
              variant="outline"
              className="bg-red-500/10 border-red-500/40 text-red-400 hover:text-red-300 hover:bg-red-500/20"
              onClick={this.handleReset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            
            <Button
              variant="default"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-4 p-3 bg-black/50 rounded text-left overflow-auto max-h-[200px] w-full text-xs">
              <p className="font-mono text-red-400 mb-1">错误信息: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="font-mono text-gray-400 text-xs whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    // 如果没有错误，正常渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;

// 为React函数组件提供的错误边界HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

// 为特定部分提供错误边界的钩子
export function ErrorBoundaryGroup({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
} 