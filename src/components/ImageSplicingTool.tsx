import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check, Upload, RefreshCw } from "lucide-react";
import LayoutOptions from "@/components/LayoutOptions";
import OptionsPanel from "@/components/OptionsPanel";
import ImageUploader from "@/components/ImageUploader";
import ImagePreview from "@/components/ImagePreview";
import { createSplicedImage, downloadImage, copyImageToClipboard } from "@/lib/image-processing";
import { isImageFile } from "@/lib/image-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 默认设置
const DEFAULT_SETTINGS = {
  layout: "row" as "single" | "row" | "grid",
  rows: 1,
  columns: 1,
  spacing: 0,
  autoSize: true,
  format: "png" as string,
  quality: 90,
  autoSwitchToPreview: true,
  autoProcessOnUpload: true
};

const ImageSplicingTool: React.FC = () => {
  const { toast } = useToast();
  const [layout, setLayout] = useState<"single" | "row" | "grid">(DEFAULT_SETTINGS.layout);
  const [rows, setRows] = useState(DEFAULT_SETTINGS.rows);
  const [columns, setColumns] = useState(DEFAULT_SETTINGS.columns);
  const [spacing, setSpacing] = useState(DEFAULT_SETTINGS.spacing);
  const [autoSize, setAutoSize] = useState(DEFAULT_SETTINGS.autoSize);
  const [format, setFormat] = useState<string>(DEFAULT_SETTINGS.format);
  const [quality, setQuality] = useState(DEFAULT_SETTINGS.quality);
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<{
    url: string | null;
    blob: Blob | null;
    canvas: HTMLCanvasElement | null;
    dimensions?: { width: number; height: number };
  }>({ url: null, blob: null, canvas: null });
  const [activeTab, setActiveTab] = useState<"upload" | "edit">("upload");
  const [isCopied, setIsCopied] = useState(false);
  const [autoSwitchToPreview, setAutoSwitchToPreview] = useState(DEFAULT_SETTINGS.autoSwitchToPreview);
  const [autoProcessOnUpload, setAutoProcessOnUpload] = useState(DEFAULT_SETTINGS.autoProcessOnUpload);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 添加日志 - 记录每次状态变化
  useEffect(() => {
    console.log('当前状态:', { 
      layout, 
      images: images.length, 
      activeTab, 
      processing: isProcessing,
      hasResult: !!resultImage.canvas
    });
  }, [layout, images.length, activeTab, isProcessing, resultImage.canvas]);

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('imageToolSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        console.log('加载设置:', settings); // 添加日志
        setLayout(settings.layout || DEFAULT_SETTINGS.layout);
        setRows(settings.rows || DEFAULT_SETTINGS.rows);
        setColumns(settings.columns || DEFAULT_SETTINGS.columns);
        setSpacing(settings.spacing || DEFAULT_SETTINGS.spacing);
        setAutoSize(settings.autoSize !== undefined ? settings.autoSize : DEFAULT_SETTINGS.autoSize);
        setFormat(settings.format || DEFAULT_SETTINGS.format);
        setQuality(settings.quality || DEFAULT_SETTINGS.quality);
        setAutoSwitchToPreview(settings.autoSwitchToPreview !== undefined ? 
          settings.autoSwitchToPreview : DEFAULT_SETTINGS.autoSwitchToPreview);
        setAutoProcessOnUpload(settings.autoProcessOnUpload !== undefined ? 
          settings.autoProcessOnUpload : DEFAULT_SETTINGS.autoProcessOnUpload);
      } catch (e) {
        console.error("加载保存的设置时出错", e);
      }
    } else {
      console.log('未找到已保存的设置，使用默认设置'); // 添加日志
    }
  }, []);

  // 保存设置到localStorage
  useEffect(() => {
    const currentSettings = {
      layout,
      rows,
      columns,
      spacing,
      autoSize,
      format,
      quality,
      autoSwitchToPreview,
      autoProcessOnUpload
    };
    localStorage.setItem('imageToolSettings', JSON.stringify(currentSettings));
  }, [layout, rows, columns, spacing, autoSize, format, quality, autoSwitchToPreview, autoProcessOnUpload]);

  const handleUploadButtonClick = () => {
    console.log('点击上传按钮'); // 添加日志
    setActiveTab("upload");
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 50);
  };

  // 快速上传并处理
  const handleQuickUpload = () => {
    console.log('快速上传并处理'); // 添加日志
    handleUploadButtonClick();
    // 后续处理由handleImagesSelected完成
  };

  // 一键复制当前图片
  const handleQuickCopy = () => {
    console.log('一键复制'); // 添加日志
    if (resultImage.canvas) {
      handleCopyImage();
    } else if (images.length > 0) {
      console.log('需要先创建拼接图片'); // 添加日志
      handleCreateSplicedImage(true).then(() => {
        // 因为状态更新是异步的，我们需要延迟执行复制操作
        setTimeout(() => {
          if (resultImage.canvas) {
            handleCopyImage();
          } else {
            console.error('拼接完成后canvas仍然不存在'); // 添加日志
          }
        }, 500);
      });
    } else {
      toast({
        title: "未找到图片",
        description: "请先上传图片",
        variant: "destructive",
      });
    }
  };

  const handleReorderImages = (newOrder: File[]) => {
    console.log('重新排序图片', newOrder.length); // 添加日志
    setImages(newOrder);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        const imageFiles = files.filter(isImageFile);

        if (imageFiles.length > 0) {
          console.log('从剪贴板粘贴图片', imageFiles.length); // 添加日志
          setImages(prev => [...prev, ...imageFiles]);
          toast({
            title: "图片已添加",
            description: `已添加 ${imageFiles.length} 张图片从剪贴板`,
          });

          // 强制设置为横排模式
          setLayout("row");
          console.log('粘贴后设置布局为横排'); // 添加日志

          if (autoSwitchToPreview && activeTab === "upload") {
            setActiveTab("edit");
          }

          if (autoProcessOnUpload) {
            setTimeout(() => handleCreateSplicedImage(false), 100);
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
  }, [toast, images, activeTab, autoSwitchToPreview, autoProcessOnUpload, resultImage.canvas]);

  useEffect(() => {
    console.log('布局或图片数量变化', layout, images.length); // 添加日志
    if (layout === "single" && images.length > 1) {
      setRows(1);
      setColumns(1);
    } else if (layout === "row") {
      setRows(Math.max(images.length, 1));
      setColumns(1);
    } else if (layout === "grid") {
      setRows(2);
      setColumns(2);
    }
  }, [layout, images.length]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (images.length > 0) {
        console.log('设置变化，自动刷新预览'); // 添加日志
        handleCreateSplicedImage(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [layout, rows, columns, spacing, autoSize, format, quality, images]);

  const handleImagesSelected = (files: File[]) => {
    const imageFiles = files.filter(isImageFile);
    console.log('选择图片', files.length, '有效图片:', imageFiles.length); // 添加日志

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

    // 强制设置为横排模式
    console.log('设置布局为横排'); // 添加日志
    setLayout("row");

    // 自动切换到编辑标签
    if (autoSwitchToPreview && (activeTab === "upload" || images.length === 0)) {
      console.log('自动切换到编辑标签'); // 添加日志
      setActiveTab("edit");
    }

    // 自动处理图片
    if (autoProcessOnUpload) {
      console.log('自动处理上传的图片'); // 添加日志
      setTimeout(() => handleCreateSplicedImage(false), 100);
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('移除图片', index); // 添加日志
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLayoutChange = (newLayout: "single" | "row" | "grid") => {
    console.log('布局变更', newLayout); // 添加日志
    setLayout(newLayout);

    if (newLayout === "single") {
      setRows(1);
      setColumns(1);
    } else if (newLayout === "row") {
      setRows(Math.max(images.length, 1));
      setColumns(1);
    } else if (newLayout === "grid") {
      setRows(2);
      setColumns(2);
    }
  };

  const handleCreateSplicedImage = async (showNotification = true) => {
    if (images.length === 0) {
      console.log('没有图片，无法创建拼接图片'); // 添加日志
      return;
    }

    try {
      console.log('开始创建拼接图片', { layout, rows, columns, format }); // 添加日志
      setIsProcessing(true);

      const config = {
        rows: layout === "row" ? images.length : rows,
        columns: layout === "row" ? 1 : columns,
        spacing,
        format,
        quality,
        autoSize,
      };
      console.log('拼接配置', config); // 添加日志

      const { blob, canvas } = await createSplicedImage(images, config);
      console.log('拼接完成，获得blob和canvas'); // 添加日志
      const url = URL.createObjectURL(blob);

      // 获取图像尺寸
      const img = new Image();
      img.onload = () => {
        console.log('图片加载完成，尺寸:', img.width, 'x', img.height); // 添加日志
        setResultImage({ 
          url, 
          blob, 
          canvas,
          dimensions: {
            width: img.width,
            height: img.height
          }
        });
      };
      img.onerror = (e) => {
        console.error('图片加载失败', e); // 添加日志
      };
      img.src = url;

      if (showNotification) {
        toast({
          description: "拼接图片已创建，Ctrl+C 复制",
        });
      }
    } catch (error) {
      console.error("创建拼接图片时出错", error);
      toast({
        title: "出错了",
        description: "创建拼接图片时出错",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
    
    // 返回Promise以支持链式操作
    return Promise.resolve();
  };

  const handleDownloadImage = () => {
    console.log('下载图片'); // 添加日志
    if (resultImage.blob) {
      downloadImage(resultImage.blob, `spliced-image.${format}`);
      toast({
        description: "图片已下载",
      });
    }
  };

  const handleCopyImage = async () => {
    console.log('复制图片到剪贴板'); // 添加日志
    if (resultImage.canvas) {
      const success = await copyImageToClipboard(resultImage.canvas);

      if (success) {
        setIsCopied(true);
        toast({
          description: "图片已复制到剪贴板",
        });

        setTimeout(() => setIsCopied(false), 2000);
      } else {
        console.error('复制到剪贴板失败'); // 添加日志
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
    console.log('重置所有设置'); // 添加日志
    setImages([]);
    setLayout(DEFAULT_SETTINGS.layout);
    setRows(DEFAULT_SETTINGS.rows);
    setColumns(DEFAULT_SETTINGS.columns);
    setSpacing(DEFAULT_SETTINGS.spacing);
    setAutoSize(DEFAULT_SETTINGS.autoSize);
    setFormat(DEFAULT_SETTINGS.format);
    setQuality(DEFAULT_SETTINGS.quality);
    setResultImage({ url: null, blob: null, canvas: null });
    setActiveTab("upload");

    toast({
      description: "所有图片和设置已重置",
      className: "bg-tool-primary/20 border border-tool-primary text-white font-medium"
    });
  };

  const getLayoutDescription = () => {
    if (layout === 'single') {
      if (images.length <= 1) {
        return '单幅';
      }
      return `横排 (${images.length} 张图片)`;
    } else if (layout === 'row') {
      return `横排 (${rows} 张图片)`;
    } else {
      return `网格 (${rows}×${columns})`;
    }
  };

  // 切换自动设置
  const toggleAutoSettings = (setting: 'autoSwitchToPreview' | 'autoProcessOnUpload') => {
    console.log('切换设置', setting); // 添加日志
    if (setting === 'autoSwitchToPreview') {
      setAutoSwitchToPreview(!autoSwitchToPreview);
    } else {
      setAutoProcessOnUpload(!autoProcessOnUpload);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-6">
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

      {/* 快捷操作栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          size="sm"
          variant="outline"
          className="text-white bg-tool-primary/40 hover:bg-tool-primary/60 gap-1.5 transition-all"
          onClick={handleQuickUpload}
        >
          <Upload size={14} />
          上传并拼接
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="text-white bg-tool-primary/40 hover:bg-tool-primary/60 gap-1.5 transition-all"
          onClick={handleQuickCopy}
          disabled={!resultImage.canvas && images.length === 0}
        >
          <Copy size={14} />
          一键复制
        </Button>
        
        <div className="ml-auto flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer text-xs" 
                     onClick={() => toggleAutoSettings('autoSwitchToPreview')}>
                  <div className={`w-3 h-3 rounded-full ${autoSwitchToPreview ? 'bg-tool-primary' : 'bg-gray-600'}`}></div>
                  <span className="text-gray-400">自动预览</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>上传后自动切换到预览</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer text-xs"
                     onClick={() => toggleAutoSettings('autoProcessOnUpload')}>
                  <div className={`w-3 h-3 rounded-full ${autoProcessOnUpload ? 'bg-tool-primary' : 'bg-gray-600'}`}></div>
                  <span className="text-gray-400">自动处理</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>上传后自动处理图片</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
              <ImageUploader 
                onImagesSelected={handleImagesSelected} 
                ref={fileInputRef}
              />
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
                    <span className="text-tool-primary font-medium">{autoSize ? '保持原尺寸' : '统一尺寸'}</span>
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
                  className="text-tool-primary border-tool-border/50 bg-black hover:bg-tool-primary/10 hover:border-tool-primary h-8 shadow-md"
                  onClick={() => handleCreateSplicedImage(true)}
                  disabled={isProcessing || images.length === 0}
                >
                  <RefreshCw size={14} className="mr-1.5" />
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
                    <>
                      <img
                        src={resultImage.url}
                        alt="拼接结果"
                        className="max-w-full max-h-full object-contain"
                      />
                      {resultImage.dimensions && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <span>{resultImage.dimensions.width} × {resultImage.dimensions.height}px</span>
                        </div>
                      )}
                    </>
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
                    onClick={handleUploadButtonClick}
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
                  className="text-white border-tool-primary bg-tool-primary/40 hover:bg-tool-primary/60 hover:border-tool-primary gap-1.5 transition-all shadow-md"
                  onClick={handleCopyImage}
                  disabled={!resultImage.canvas || isProcessing}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? "已复制" : "复制图片"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-tool-primary bg-tool-primary/40 hover:bg-tool-primary/60 hover:border-tool-primary gap-1.5 transition-all shadow-md"
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
            <div className="text-xs text-gray-300 flex flex-wrap items-center justify-between gap-y-2">
              <span className="text-tool-primary/80 font-medium">快捷键: </span>
              <div className="flex flex-wrap gap-4">
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
