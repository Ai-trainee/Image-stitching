import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Image, ClipboardPaste } from "lucide-react";
import { IMAGE_EXTENSIONS_DISPLAY } from "@/lib/image-types";

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
}

// 使用forwardRef包装组件以支持ref转发
const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(({ onImagesSelected }, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 将内部的fileInputRef暴露给父组件
  useImperativeHandle(ref, () => fileInputRef.current as HTMLInputElement);

  const handleFilesSelected = (files: FileList) => {
    const imageFiles = Array.from(files);
    onImagesSelected(imageFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
        isDragging 
          ? "border-tool-primary bg-tool-primary/5 shadow-[0_0_15px_rgba(0,230,230,0.15)]" 
          : "border-tool-border/40 bg-black hover:border-tool-primary/50 hover:bg-tool-primary/5"
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={IMAGE_EXTENSIONS_DISPLAY.map(ext => `.${ext.name}`).join(",")}
        onChange={handleFileInputChange}
        multiple
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-tool-primary/20 blur-md rounded-full animate-pulse"></div>
            <Image size={40} className={`${isDragging ? 'text-tool-primary' : 'text-white'} relative`} />
          </div>
          <ClipboardPaste size={24} className="text-tool-primary ml-2 animate-pulse" />
        </div>
        
        <h3 className={`text-lg font-medium mb-3 ${isDragging ? 'text-tool-primary' : 'text-white'}`}>
          拖入或选择图片
        </h3>
        
        <div className="px-4 py-1.5 bg-tool-primary/20 border border-tool-primary/50 rounded-full inline-block mb-4 shadow-md">
          <span className="text-tool-primary font-bold">Ctrl+V</span>
          <span className="text-white ml-1 font-medium">粘贴图片</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {IMAGE_EXTENSIONS_DISPLAY.map((ext) => (
            <div key={ext.name} className="flex items-center text-xs bg-tool-primary/10 border border-tool-primary/30 px-2.5 py-1 rounded-md shadow-sm">
              <span className="mr-1 text-tool-primary font-bold">✓</span>
              <span className="text-white">.{ext.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 发光动画效果 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-tool-primary/10 via-transparent to-transparent transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* 焦点动画 */}
      <div className="absolute -inset-1 bg-gradient-to-r from-tool-primary/0 via-tool-primary/20 to-tool-primary/0 blur-sm opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-700"></div>
    </div>
  );
});

// 添加显示名称，有助于调试
ImageUploader.displayName = "ImageUploader";

export default ImageUploader;
