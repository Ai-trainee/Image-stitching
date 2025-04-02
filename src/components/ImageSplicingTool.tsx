import React, { useState, useRef, useEffect } from 'react';

const ImageSplicingTool: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [totalHeight, setTotalHeight] = useState(0);
  const [lastAction, setLastAction] = useState<string>(''); // 记录最后一次操作

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items).filter(item => item.type.indexOf('image') !== -1);

      if (imageItems.length > 0) {
        setLastAction('paste');
        const imageBlobs = imageItems.map(item => item.getAsFile());
        const validBlobs = imageBlobs.filter(blob => blob !== null) as File[];

        if (validBlobs.length > 0) {
          // 添加新粘贴的图片
          handleNewImages(validBlobs);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [images]);

  // 监听拖放事件
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDropActive(true);
    };

    const handleDragLeave = () => {
      setDropActive(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDropActive(false);
      setLastAction('drop');

      if (e.dataTransfer?.files) {
        const imageFiles = Array.from(e.dataTransfer.files).filter(
          file => file.type.indexOf('image') !== -1
        );

        if (imageFiles.length > 0) {
          handleNewImages(imageFiles);
        }
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('dragover', handleDragOver as EventListener);
      element.addEventListener('dragleave', handleDragLeave as EventListener);
      element.addEventListener('drop', handleDrop as EventListener);

      return () => {
        element.removeEventListener('dragover', handleDragOver as EventListener);
        element.removeEventListener('dragleave', handleDragLeave as EventListener);
        element.removeEventListener('drop', handleDrop as EventListener);
      };
    }
  }, [images]);

  // 处理上传图片
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setLastAction('upload');
      const newFiles = Array.from(event.target.files);
      handleNewImages(newFiles);
    }
  };

  // 处理新加入的图片
  const handleNewImages = (newFiles: File[]) => {
    // 重置复制状态
    setIsCopied(false);

    // 添加新图片
    setImages(prevImages => [...prevImages, ...newFiles]);

    // 生成预览URL
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prevUrls => [...prevUrls, ...newUrls]);

    // 加载图片并拼接
    Promise.all(
      newFiles.map(file => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = URL.createObjectURL(file);
        });
      })
    ).then(loadedImages => {
      // 更新现有画布或创建新画布
      updateCanvas([...images, ...newFiles], loadedImages);
    });
  };

  // 更新画布
  const updateCanvas = async (allFiles: File[], newImages: HTMLImageElement[]) => {
    setIsProcessing(true);

    try {
      // 加载所有图片（包括之前的和新的）
      const allImagePromises = allFiles.map(file => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = URL.createObjectURL(file);
        });
      });

      const allLoadedImages = await Promise.all(allImagePromises);

      // 计算总高度
      let maxWidth = 0;
      let totalHeight = 0;

      allLoadedImages.forEach(img => {
        maxWidth = Math.max(maxWidth, img.width);
        totalHeight += img.height;
      });

      setTotalHeight(totalHeight);

      // 创建或获取画布
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // 设置画布尺寸
      canvas.width = maxWidth || 800; // 默认最小宽度
      canvas.height = totalHeight || 600; // 默认最小高度

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制所有图片
      let yOffset = 0;
      allLoadedImages.forEach(img => {
        ctx.drawImage(img, 0, yOffset);
        yOffset += img.height;
      });

      setResultCanvas(canvas);
      setCanvasRef(canvas);
    } catch (error) {
      console.error('处理图片时出错:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 保存画布引用
  const setCanvasRef = (canvas: HTMLCanvasElement) => {
    if (canvasRef.current !== canvas) {
      canvasRef.current = canvas;
    }
  };

  // 复制结果到剪贴板
  const copyResult = async () => {
    if (!resultCanvas) return;

    try {
      setIsProcessing(true);

      // 将画布转换为Blob
      const blob = await new Promise<Blob>((resolve) => {
        resultCanvas.toBlob(blob => {
          if (blob) resolve(blob);
          else throw new Error('无法创建图片Blob');
        }, 'image/png');
      });

      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      setIsCopied(true);
      setLastAction('copy');

      // 显示2秒后重置状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

    } catch (error) {
      console.error('复制到剪贴板时出错:', error);
      alert('复制失败，请重试或使用右键菜单复制图片');
    } finally {
      setIsProcessing(false);
    }
  };

  // 清除所有图片
  const clearImages = () => {
    setImages([]);
    setPreviewUrls([]);

    // 释放预览URL
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    // 清空画布
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setResultCanvas(null);
    setTotalHeight(0);
    setLastAction('clear');
  };

  // 删除单张图片
  const removeImage = (index: number) => {
    // 移除图片
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    // 释放并移除预览URL
    URL.revokeObjectURL(previewUrls[index]);
    const newUrls = [...previewUrls];
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);

    // 如果没有图片，重置
    if (newImages.length === 0) {
      setResultCanvas(null);
      setTotalHeight(0);
      return;
    }

    // 重新生成拼接结果
    Promise.all(
      newImages.map(file => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = URL.createObjectURL(file);
        });
      })
    ).then(loadedImages => {
      updateCanvas(newImages, loadedImages);
    });

    setLastAction('remove');
  };

  // 下载结果
  const downloadResult = () => {
    if (!resultCanvas) return;

    const link = document.createElement('a');
    link.download = '拼接图片.png';
    link.href = resultCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setLastAction('download');
  };

  return (
    <div className="container mx-auto px-4">
      <div
        ref={containerRef}
        className={`p-5 border-2 border-dashed rounded-xl transition-all 
          ${dropActive ? 'border-tool-primary bg-tool-primary/10' : 'border-tool-border/30 bg-black/30'} 
          ${images.length > 0 ? 'mb-6' : 'mb-0'}`}
      >
        {images.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="text-6xl mb-4 text-tool-primary/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-20 h-20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">将图片粘贴到这里</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              直接使用 <span className="font-bold text-tool-primary">Ctrl+V</span> 粘贴图片，或者拖放图片到此处
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-tool-primary/10 text-tool-primary border border-tool-primary/30 rounded-md hover:bg-tool-primary/20 transition-colors"
              >
                选择图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <>
            {/* 结果预览 */}
            <div className="mb-5 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">预览结果</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearImages}
                  className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors"
                  disabled={isProcessing}
                >
                  清除全部
                </button>
                <button
                  onClick={downloadResult}
                  className="px-3 py-1.5 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors"
                  disabled={!resultCanvas || isProcessing}
                >
                  下载图片
                </button>
                <button
                  onClick={copyResult}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${isCopied
                      ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                      : 'bg-tool-primary/10 text-tool-primary border border-tool-primary/30 hover:bg-tool-primary/20'
                    }`}
                  disabled={!resultCanvas || isProcessing}
                >
                  {isCopied ? '已复制到剪贴板' : '复制到剪贴板'}
                </button>
              </div>
            </div>

            {/* 拼接结果 */}
            <div className="bg-black/60 border border-tool-border/40 rounded-lg p-4 mb-5 overflow-auto max-h-[400px]">
              {isProcessing ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tool-primary"></div>
                </div>
              ) : resultCanvas ? (
                <div
                  className="flex justify-center"
                  style={{ minHeight: Math.min(400, totalHeight) }}
                >
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-black rounded shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-[200px] text-gray-400">
                  正在处理图片...
                </div>
              )}
            </div>

            {/* 操作提示 */}
            <div className="text-center mb-5">
              <p className="text-gray-400 text-sm">
                {lastAction === 'copy'
                  ? '✅ 图片已复制，可直接粘贴到公众号编辑器'
                  : '👆 点击"复制到剪贴板"后可直接粘贴到公众号'}
              </p>
            </div>

            {/* 图片缩略图列表 */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">已添加的图片</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative group border border-tool-border/40 rounded-md overflow-hidden bg-black/50"
                  >
                    <img
                      src={url}
                      alt={`预览图 ${index + 1}`}
                      className="w-full h-auto object-contain"
                      style={{ minHeight: '80px', maxHeight: '100px' }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除图片"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* 添加更多图片按钮 */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-tool-border/30 rounded-md flex items-center justify-center cursor-pointer hover:border-tool-primary/40 hover:bg-tool-primary/5 transition-all"
                  style={{ minHeight: '80px', maxHeight: '100px' }}
                >
                  <div className="text-center p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-400 mt-1 block">添加图片</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 简短提示 */}
      {images.length === 0 && (
        <div className="text-center mt-4 mb-8">
          <p className="text-gray-400 text-sm">
            提示: 可以直接按 <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+V</kbd> 粘贴截图或从网页复制的图片
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageSplicingTool;
