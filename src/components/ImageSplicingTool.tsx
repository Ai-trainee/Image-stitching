import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check, Plus, RefreshCw } from "lucide-react";
import LayoutOptions from "@/components/LayoutOptions";
import OptionsPanel from "@/components/OptionsPanel";
import ImageUploader from "@/components/ImageUploader";
import ImagePreview from "@/components/ImagePreview";
import { createSplicedImage, downloadImage, copyImageToClipboard } from "@/lib/image-processing";
import { isImageFile } from "@/lib/image-types";

const ImageSplicingTool: React.FC = () => {
  const { toast } = useToast();
  const [layout, setLayout] = useState<"single" | "row" | "grid">("single");
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [spacing, setSpacing] = useState(0);
  const [autoSize, setAutoSize] = useState(false);
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
  const [history, setHistory] = useState<{images: File[], layout: "single" | "row" | "grid", autoSize: boolean}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewAreaRef = useRef<HTMLDivElement>(null);

  const addToHistory = (newImages: File[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    
    newHistory.push({
      images: [...newImages],
      layout,
      autoSize
    });
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleReorderImages = (newOrder: File[]) => {
    addToHistory(newOrder);
    setImages(newOrder);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      console.log("粘贴事件触发", e);
      console.log("剪贴板数据:", e.clipboardData);

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        console.log("粘贴的文件:", files);

        const imageFiles = files.filter(isImageFile);
        console.log("过滤后的图片文件:", imageFiles);

        if (imageFiles.length > 0) {
          const newImages = [...images, ...imageFiles];
          addToHistory(newImages);
          setImages(newImages);
          toast({
            title: "已添加图片",
            description: `成功添加 ${imageFiles.length} 张图片`,
          });

          if (activeTab === "upload" && images.length === 0) {
            setActiveTab("edit");
          }
        } else {
          console.log("未发现有效图片文件");
        }
      } else {
        console.log("剪贴板中没有文件数据");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c' && resultImage.canvas) {
        handleCopyImage();
      }
      
      if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toast, images, activeTab, resultImage.canvas, history, historyIndex, layout, autoSize]);

  useEffect(() => {
    if (layout === "single" && images.length > 1) {
      setRows(1);
      setColumns(1);
    } else if (layout === "row" && images.length > 0) {
      setRows(images.length);
      setColumns(1);
    } else if (layout === "grid") {
    }
  }, [layout, images.length]);

  // 初始化历史记录
  useEffect(() => {
    if (historyIndex === -1 && images.length > 0) {
      setHistory([{ images, layout, autoSize }]);
      setHistoryIndex(0);
    }
  }, [historyIndex, images, layout, autoSize]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (images.length > 0) {
        handleCreateSplicedImage(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [layout, rows, columns, spacing, autoSize, format, quality, images]);

  const handleImagesSelected = (files: File[]) => {
    const imageFiles = files.filter(isImageFile);

    if (imageFiles.length === 0) {
      toast({
        title: "格式错误",
        description: "请选择支持的图片文件格式",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...imageFiles];
    addToHistory(newImages);
    setImages(newImages);
    toast({
      title: "已添加图片",
      description: `成功添加 ${imageFiles.length} 张图片`,
    });

    if (images.length === 0 && activeTab === "upload") {
      setActiveTab("edit");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    addToHistory(newImages);
    setImages(newImages);
  };

  const handleLayoutChange = (newLayout: "single" | "row" | "grid") => {
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
  };

  const handleCreateSplicedImage = async (showNotification = true) => {
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
      };

      const { blob, canvas } = await createSplicedImage(images, config);
      const url = URL.createObjectURL(blob);

      setResultImage({ url, blob, canvas });

      if (showNotification) {
        toast({
          title: "拼接成功",
          description: "图片已创建，按Ctrl+C复制或点击复制按钮",
        });
      }
    } catch (error) {
      console.error("Error creating spliced image:", error);
      toast({
        title: "处理失败",
        description: "创建拼接图片时出错，请重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = () => {
    if (resultImage.blob) {
      downloadImage(resultImage.blob, `spliced-image.${format}`);
      toast({
        title: "已下载",
        description: "图片已保存到您的下载文件夹",
      });
    }
  };

  const handleCopyImage = async () => {
    if (resultImage.canvas) {
      const success = await copyImageToClipboard(resultImage.canvas);

      if (success) {
        setIsCopied(true);
        toast({
          title: "已复制",
          description: "图片已复制到剪贴板，可直接粘贴使用",
        });

        setTimeout(() => setIsCopied(false), 2000);
      } else {
        toast({
          title: "复制失败",
          description: "请点击复制按钮或使用右键菜单复制",
          variant: "destructive",
        });
      }
    }
  };

  const getCurrentConfig = () => ({
    rows: layout === "row" ? images.length || 1 : rows,
    columns: layout === "row" ? 1 : columns,
    spacing,
    format,
    quality,
    autoSize,
  });

  const handleReset = () => {
    setImages([]);
    setLayout("single");
    setRows(2);
    setColumns(2);
    setSpacing(0);
    setAutoSize(false);
    setFormat("png");
    setQuality(90);
    setResultImage({ url: null, blob: null, canvas: null });
    setActiveTab("upload");

    toast({
      title: "已重置",
      description: "所有图片和设置已恢复到初始状态",
    });
  };

  const getLayoutDescription = () => {
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
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setImages(prevState.images);
      setLayout(prevState.layout);
      setAutoSize(prevState.autoSize);
      
      toast({
        title: "已撤销",
        description: "成功撤销上一步操作",
      });
    }
  };

  const handlePreviewUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleImagesSelected(files);
    }
  };

  const handlePreviewDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePreviewDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleImagesSelected(files);
    }
  };

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
          快速拼接图片，一键复制粘贴。
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
                    <span>{getLayoutDescription()}</span>
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
                  onClick={handlePreviewUploadClick}
                >
                  <Plus size={14} className="mr-1.5" />
                  添加图片
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-tool-primary border-tool-border/50 bg-black/60 hover:bg-tool-primary/10 hover:border-tool-primary h-8"
                  onClick={() => handleCreateSplicedImage(true)}
                  disabled={isProcessing || images.length === 0}
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  {isProcessing ? "处理中..." : "刷新预览"}
                </Button>
              </div>
            </div>

            <div 
              className="relative border border-tool-border/50 rounded-lg overflow-hidden mb-4 shadow-[0_0_15px_rgba(0,230,230,0.1)]"
              ref={previewAreaRef}
              onDragOver={handlePreviewDragOver}
              onDragLeave={handlePreviewDragLeave}
              onDrop={handlePreviewDrop}
            >
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
                  
                  {isDragging && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center flex-col">
                      <div className="w-16 h-16 mb-5 text-tool-primary opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-tool-primary text-lg font-semibold">释放添加图片</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center bg-black/50 border border-tool-border/30 rounded-lg p-10 h-[340px] transition-all ${isDragging ? "border-tool-primary/70 bg-tool-primary/5" : ""}`}>
                  <div className={`w-16 h-16 mb-5 transition-colors ${isDragging ? "text-tool-primary/60" : "text-tool-primary/30"} opacity-80`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className={`text-gray-400 mb-4 transition-colors ${isDragging ? "text-tool-primary" : ""}`}>
                    {isDragging ? "释放鼠标上传图片" : "拖拽或点击上传图片"}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.svg,.ico,.bmp"
                    onChange={handleFileInputChange}
                    multiple
                  />
                  <Button
                    onClick={handlePreviewUploadClick}
                    className={`bg-tool-primary/10 border border-tool-primary/30 text-tool-primary hover:bg-tool-primary/20 hover:border-tool-primary transition-all ${isDragging ? "bg-tool-primary/20 border-tool-primary/50" : ""}`}
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
                <span className="flex items-center gap-1 bg-tool-primary/10 px-2 py-1 rounded border border-tool-primary/20">
                  <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-primary text-tool-primary text-xs font-bold">Ctrl+Z</kbd>
                  <span className="text-white">撤销操作</span>
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
