import React, { useState, useEffect, useRef } from "react";
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

  const handleReorderImages = (newOrder: File[]) => {
    setImages(newOrder);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        const imageFiles = files.filter(isImageFile);
        
        if (imageFiles.length > 0) {
          setImages(prev => [...prev, ...imageFiles]);
          toast({
            title: "图片已添加",
            description: `已添加 ${imageFiles.length} 张图片从剪贴板`,
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
  }, [toast, images, activeTab, resultImage.canvas]);

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
        title: "无效文件",
        description: "请选择支持的图片文件格式",
        variant: "destructive",
      });
      return;
    }

    setImages(prev => [...prev, ...imageFiles]);
    toast({
      description: `已添加 ${imageFiles.length} 张图片`,
    });
    
    if (images.length === 0 && activeTab === "upload") {
      setActiveTab("edit");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
  };

  const handleDownloadImage = () => {
    if (resultImage.blob) {
      downloadImage(resultImage.blob, `spliced-image.${format}`);
      toast({
        description: "图片已下载",
      });
    }
  };

  const handleCopyImage = async () => {
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
    if (images.length > 0) {
      const confirmed = window.confirm("确定要重置所有图片和设置吗？");
      if (!confirmed) return;
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

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-tool-primary bg-clip-text text-transparent">
            Aitrainee
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
          快速处理图片，一键复制粘贴，解决时讯图片拼接太慢问题。适用于公众号写作、内容创作等场景。
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
            <div className="text-xs text-gray-300 flex items-center justify-between">
              <span className="text-tool-primary/80 font-medium">快捷键: </span>
              <div className="flex space-x-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+V</kbd> 粘贴图片
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-black rounded border border-tool-border text-tool-primary text-xs">Ctrl+C</kbd> 复制结果
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
