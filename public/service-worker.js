const CACHE_NAME = 'picmac-cache-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/vendor-react.js',
  '/assets/vendor-ui.js',
  '/assets/index.js'
];

// 安装Service Worker并缓存所有静态资源
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing');
  
  // 确保安装过程等待直到缓存完成
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        // 强制新的Service Worker立即激活
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// 激活时清除旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Successfully activated');
        // 确保Service Worker立即控制所有客户端
        return self.clients.claim();
      })
  );
});

// 拦截请求并优先从缓存返回
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  // 忽略Chrome扩展请求和导航预加载请求
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin || 
    event.request.url.includes('chrome-extension')
  ) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 如果找到缓存响应，直接返回
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 如果未找到缓存，尝试从网络获取
        return fetch(event.request)
          .then(response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 缓存新的响应
            const responseToCache = response.clone();
            
            // 判断是否应该缓存这个资源
            if (shouldCache(event.request.url)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            // 如果网络请求失败，可以返回一个回退页面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            return new Response(
              JSON.stringify({ 
                error: 'Network request failed',
                offline: true 
              }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
      })
  );
});

// 判断是否应该缓存资源
function shouldCache(url) {
  const parsedUrl = new URL(url);
  
  // 排除不应该缓存的资源
  const excludePatterns = [
    '/api/',
    '/analytics',
    '/socket.io'
  ];
  
  for (const pattern of excludePatterns) {
    if (parsedUrl.pathname.includes(pattern)) {
      return false;
    }
  }
  
  // 缓存静态资源
  const cacheExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot'
  ];
  
  for (const ext of cacheExtensions) {
    if (parsedUrl.pathname.endsWith(ext)) {
      return true;
    }
  }
  
  // 缓存HTML页面
  if (
    parsedUrl.pathname === '/' || 
    parsedUrl.pathname.endsWith('.html') ||
    parsedUrl.pathname.endsWith('/')
  ) {
    return true;
  }
  
  return false;
}

// 后台同步事件，可用于离线时保存数据，并在恢复连接时同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-uploads') {
    event.waitUntil(syncPendingUploads());
  }
});

// 模拟同步上传功能
async function syncPendingUploads() {
  try {
    // 在真实应用中，这里会读取IndexedDB中保存的待上传数据
    console.log('[Service Worker] Syncing pending uploads');
    // 执行上传操作
    // ...
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error; // 重新抛出错误，以便浏览器可以重试同步
  }
} 