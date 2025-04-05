import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check } from "lucide-react";
import LayoutOptions from "@/components/LayoutOptions";
import OptionsPanel from "@/components/OptionsPanel";
import ImageUploader from "@/components/ImageUploader";
import ImagePreview from "@/components/ImagePreview";
import { createSplicedImage, downloadImage, copyImageToClipboard } from "@/lib/image-processing";
import { isImageFile } from "@/lib/image-types";

// 定义防抖函数
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ImageSplicingTool: React.FC = () => {
  const { toast } = useToast();
  const [layout, setLayout] = useState<"single" | "row" | "grid">("grid");
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [spacing, setSpacing] = useState(0);
  const [autoSize, setAutoSize] = useState(true);
  const [format, setFormat] = useState<string>("png");
  const [quality, setQuality] = useState(90);
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<{
    url: string | null;
    blob: Blob | null;
    canvas: HTMLCanvasElement | null;
  }>({ url: null, blob: null, canvas: null });
  const [activeTab, setActiveTab] = useState<"upload" | "edit">("upload");
  const [isCopied, setIsCopied] = useState(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const processingTimeoutRef = useRef<number | null>(null);
  
  // 使用防抖减少频繁更新导致的重新渲染
  const debouncedConfig = useDebounce({
    layout,
    rows,
    columns,
    spacing,
    autoSize,
    format,
    quality
  }, 300);

  // 使用useCallback缓存函数引用
  const handleReorderImages = useCallback((newOrder: File[]) => {
    setImages(newOrder);
  }, []);

  // 优化粘贴事件处理
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      
      // 如果已经有很多图片，提示用户
      if (images.length > 20) {
        toast({
          title: "图片过多",
          description: "图片数量已经很多，可能会影响性能，建议先处理当前图片。",
          variant: "destructive",
        });
        return;
      }
      
      if (e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        const imageFiles = files.filter(isImageFile);

        if (imageFiles.length > 0) {
          // 限制一次添加的数量
          const maxAddCount = 10;
          const filesToAdd = imageFiles.slice(0, maxAddCount);
          
          setImages(prev => [...prev, ...filesToAdd]);
          toast({
            title: "图片已添加",
            description: `已添加 ${filesToAdd.length} 张图片从剪贴板${imageFiles.length > maxAddCount ? `（限制为${maxAddCount}张）` : ''}`,
          });

          if (activeTab === "upload" && images.length === 0) {
            setActiveTab("edit");
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c' && resultImage.canvas) {
        handleCopyImage();
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toast, images.length, activeTab, resultImage.canvas]);

  // 根据布局类型调整行列数
  useEffect(() => {
    if (layout === "single" && images.length > 1) {
      setRows(1);
      setColumns(1);
    } else if (layout === "row" && images.length > 0) {
      setRows(images.length);
      setColumns(1);
    }
  }, [layout, images.length]);

  // 图片变更或配置变更时重新生成拼接图片
  useEffect(() => {
    if (images.length === 0) return;
    
    // 清除之前的超时
    if (processingTimeoutRef.current !== null) {
      window.clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // 设置一个新的超时
    processingTimeoutRef.current = window.setTimeout(() => {
      handleCreateSplicedImage(false);
      processingTimeoutRef.current = null;
    }, 500);
    
    return () => {
      if (processingTimeoutRef.current !== null) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    };
  }, [debouncedConfig, images]);

  // 图片选择处理函数
  const handleImagesSelected = useCallback((files: File[]) => {
    // 限制最大图片数量
    const maxTotalImages = 30;
    const imageFiles = files.filter(isImageFile);

    if (imageFiles.length === 0) {
      toast({
        title: "无效文件",
        description: "请选择支持的图片文件格式",
        variant: "destructive",
      });
      return;
    }
    
    // 检查是否超出最大图片数量
    if (images.length + imageFiles.length > maxTotalImages) {
      toast({
        title: "图片数量超限",
        description: `最多只能添加 ${maxTotalImages} 张图片，已选择 ${Math.min(maxTotalImages - images.length, imageFiles.length)} 张`,
        variant: "destructive",
      });
      
      // 只添加到最大限制
      const filesToAdd = imageFiles.slice(0, maxTotalImages - images.length);
      setImages(prev => [...prev, ...filesToAdd]);
    } else {
      setImages(prev => [...prev, ...imageFiles]);
      toast({
        description: `已添加 ${imageFiles.length} 张图片`,
      });
    }

    if (images.length === 0 && activeTab === "upload") {
      setActiveTab("edit");
    }
  }, [images.length, activeTab, toast]);

  // 移除图片
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 更改布局
  const handleLayoutChange = useCallback((newLayout: "single" | "row" | "grid") => {
    setLayout(newLayout);

    if (newLayout === "single") {
      setRows(1);
      setColumns(1);
    } else if (newLayout === "row") {
      setRows(images.length || 1);
      setColumns(1);
    } else if (newLayout === "grid") {
      setRows(2);
      setColumns(2);
    }
  }, [images.length]);

  // 创建拼接图片
  const handleCreateSplicedImage = useCallback(async (showNotification = true) => {
    if (images.length === 0) {
      return;
    }

    try {
      setIsProcessing(true);

      const config = {
        rows: layout === "row" ? images.length : rows,
        columns: layout === "row" ? 1 : columns,
        spacing,
        format,
        quality,
        autoSize,
        maxSize: 2000, // 限制最大尺寸
      };

      // 使用Web Worker处理大图片（如果可能）
      const { blob, canvas } = await createSplicedImage(images, config);
      
      // 释放之前的对象URL
      if (resultImage.url) {
        URL.revokeObjectURL(resultImage.url);
      }
      
      const url = URL.createObjectURL(blob);

      setResultImage({ url, blob, canvas });

      if (showNotification) {
        toast({
          description: "拼接图片已创建，Ctrl+C 复制",
        });
      }
    } catch (error) {
      console.error("Error creating spliced image:", error);
      toast({
        title: "出错了",
        description: "创建拼接图片时出错",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [images, layout, rows, columns, spacing, format, quality, autoSize, resultImage.url, toast]);

  // 处理图片下载
  const handleDownloadImage = useCallback(() => {
    if (resultImage.blob) {
      downloadImage(resultImage.blob, `spliced-image.${format}`);
      toast({
        description: "图片已下载",
      });
    }
  }, [resultImage.blob, format, toast]);

  // 处理图片复制
  const handleCopyImage = useCallback(async () => {
    if (resultImage.canvas) {
      const success = await copyImageToClipboard(resultImage.canvas);

      if (success) {
        setIsCopied(true);
        toast({
          description: "图片已复制到剪贴板",
        });

        setTimeout(() => setIsCopied(false), 2000);
      } else {
        toast({
          title: "复制失败",
          description: "请使用右键菜单或 Ctrl+C 复制",
          variant: "destructive",
        });
      }
    }
  }, [resultImage.canvas, toast]);

  // 使用useMemo计算当前配置，减少不必要的重新计算
  const currentConfig = useMemo(() => ({
    rows: layout === "row" ? images.length || 1 : rows,
    columns: layout === "row" ? 1 : columns,
    spacing,
    format,
    quality,
    autoSize,
  }), [layout, images.length, rows, columns, spacing, format, quality, autoSize]);

  // 重置所有设置
  const handleReset = useCallback(() => {
    // 释放之前的对象URL
    if (resultImage.url) {
      URL.revokeObjectURL(resultImage.url);
    }
    
    setImages([]);
    setLayout("grid");
    setRows(2);
    setColumns(2);
    setSpacing(0);
    setAutoSize(true);
    setFormat("png");
    setQuality(90);
    setResultImage({ url: null, blob: null, canvas: null });
    setActiveTab("upload");

    toast({
      description: "所有图片和设置已重置",
    });
  }, [resultImage.url, toast]);

  // 使用useMemo计算布局描述，减少不必要的重新计算
  const layoutDescription = useMemo(() => {
    if (layout === 'single') {
      if (images.length <= 1) {
        return '单幅';
      }
      return `横排 (${images.length} 张图片)`;
    } else if (layout === 'row') {
      return `单列 (${rows} 张图片)`;
    } else {
      return `网格 (${rows}×${columns})`;
    }
  }, [layout, images.length, rows, columns]);

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-tool-primary bg-clip-text text-transparent">
            Aitrainee 图片工具
          </h1>
          <Button
            variant="outline"
            className="text-tool-primary border border-tool-border/50 bg-black/40 hover:bg-tool-primary/10 hover:border-tool-primary transition-all"
            onClick={handleReset}
          >
            一键重置
          </Button>
        </div>
        <p className="text-gray-400">
          快速拼接图片，一键复制粘贴，解决粘贴海外图片失效问题。适用于公众号写作、内容创作等场景。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-5">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "edit")} className="space-y-5">
            <TabsList className="grid w-full grid-cols-2 bg-black border border-tool-border/30 p-1 rounded-lg">
              <TabsTrigger
                value="upload"
                className="data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 data-[state=active]:bg-tool-primary data-[state=active]:text-black rounded-md font-medium"
              >
                上传图片
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 data-[state=active]:bg-tool-primary data-[state=active]:text-black rounded-md font-medium"
              >
                布局设置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 space-y-4">
              <ImageUploader onImagesSelected={handleImagesSelected} />
            </TabsContent>

            <TabsContent value="edit" className="mt-0 space-y-6">
              <div className="bg-tool-surface p-5 rounded-lg space-y-6 border border-tool-border/30 shadow-lg">
                <LayoutOptions
                  selectedLayout={layout}
                  onSelectLayout={handleLayoutChange}
                />

                <OptionsPanel
                  rows={rows}
                  columns={columns}
                  spacing={spacing}
                  autoSize={autoSize}
                  format={format}
                  quality={quality}
                  layout={layout}
                  onRowsChange={setRows}
                  onColumnsChange={setColumns}
                  onSpacingChange={setSpacing}
                  onAutoSizeChange={setAutoSize}
                  onFormatChange={setFormat}
                  onQualityChange={setQuality}
                />

                <div className="bg-black/50 rounded-lg p-4 text-xs space-y-2 border border-tool-border/20">
                  <div className="flex justify-between text-gray-300">
                    <span>当前设置:</span>
                    <span>{layoutDescription}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>间距:</span>
                    <span>{spacing}px</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>图片模式:</span>
                    <span>{autoSize ? '保持原尺寸' : '统一尺寸'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>格式:</span>
                    <span>{format.toUpperCase()} {format !== 'png' && `(${quality}%)`}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-2">
            <ImagePreview
              images={images}
              onRemoveImage={handleRemoveImage}
              onReorderImages={handleReorderImages}
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-full space-y-5">
          <div className="bg-tool-surface p-5 rounded-lg flex-grow border border-tool-border/30 shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-tool-primary/90 text-sm font-medium">实时预览 ({images.length} 张图片)</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-tool-primary border-tool-border/50 bg-black/60 hover:bg-tool-primary/10 hover:border-tool-primary h-8"
                  onClick={() => handleCreateSplicedImage(true)}
                  disabled={isProcessing || images.length === 0}
                >
                  {isProcessing ? "处理中..." : "刷新预览"}
                </Button>
              </div>
            </div>

            <div className="relative border border-tool-border/50 rounded-lg overflow-hidden mb-4 shadow-[0_0_15px_rgba(0,230,230,0.1)]">
              {images.length > 0 ? (
                <div
                  ref={resultContainerRef}
                  className="relative bg-black/80 bg-grid-pattern h-[340px] flex items-center justify-center"
                >
                  {resultImage.url ? (
                    <img
                      src={resultImage.url}
                      alt="拼接结果"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-8 h-8 border-2 border-tool-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>生成预览中...</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-tool-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-black/50 border border-tool-border/30 rounded-lg p-10 h-[340px]">
                  <div className="w-16 h-16 mb-5 text-tool-primary/30 opacity-80">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">暂无图片，请先上传</p>
                  <Button
                    onClick={() => setActiveTab("upload")}
                    className="bg-tool-primary/10 border border-tool-primary/30 text-tool-primary hover:bg-tool-primary/20 hover:border-tool-primary transition-all"
                  >
                    上传图片
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-400">
                {resultImage.url && `格式: ${format.toUpperCase()}${format !== 'png' ? ` · 质量: ${quality}%` : ''}`}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-tool-primary border-tool-border/50 bg-black/60 hover:bg-tool-primary/10 hover:border-tool-primary gap-1.5 transition-all"
                  onClick={handleCopyImage}
                  disabled={!resultImage.canvas || isProcessing}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? "已复制" : "复制图片"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-tool-primary border-tool-border/50 bg-black/60 hover:bg-tool-primary/10 hover:border-tool-primary gap-1.5 transition-all"
                  onClick={handleDownloadImage}
                  disabled={!resultImage.blob || isProcessing}
                >
                  <Download size={14} />
                  下载
                </Button>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-tool-primary/5 blur-[80px] -z-10"></div>
          </div>

          <div className="bg-tool-surface p-4 rounded-lg border border-tool-border/30 shadow-lg">
            <div className="text-sm text-white flex items-center justify-between">
              <span className="text-tool-primary font-medium">快捷键: </span>
              <div className="flex space-x-4">
                <span className="flex items-center gap-1 bg-tool-primary/10 px-2 py-1 rounded border border-tool-primary/20">
                  <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-primary text-tool-primary text-xs font-bold">Ctrl+V</kbd>
                  <span className="text-white">粘贴图片</span>
                </span>
                <span className="flex items-center gap-1 bg-tool-primary/10 px-2 py-1 rounded border border-tool-primary/20">
                  <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-primary text-tool-primary text-xs font-bold">Ctrl+C</kbd>
                  <span className="text-white">复制结果</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSplicingTool;
