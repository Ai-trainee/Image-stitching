import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { reportError } from './lib/utils'

// 创建一个Root元素并渲染应用
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("找不到root元素，无法挂载应用");
}

// 设置全局错误处理
const handleError = (error: Error) => {
  reportError(error, { source: 'global' });
  console.error('应用发生错误:', error);
};

// 设置未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  
  handleError(error);
});

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  handleError(error as Error);
  // 显示重大错误的友好消息
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2 style="color: #ff6b6b;">应用加载失败</h2>
      <p>抱歉，应用启动时遇到了问题。请尝试刷新页面或稍后再试。</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background: #4c6ef5; color: white; border: none; border-radius: 4px; cursor: pointer;">
        刷新页面
      </button>
    </div>
  `;
}

// 注册Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
  });
}
