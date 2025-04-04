import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface OptionsPanelProps {
  rows: number;
  columns: number;
  spacing: number;
  autoSize: boolean;
  format: string;
  quality: number;
  layout: "single" | "row" | "grid";
  onRowsChange: (rows: number) => void;
  onColumnsChange: (columns: number) => void;
  onSpacingChange: (spacing: number) => void;
  onAutoSizeChange: (autoSize: boolean) => void;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: number) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
  rows,
  columns,
  spacing,
  autoSize,
  format,
  quality,
  layout,
  onRowsChange,
  onColumnsChange,
  onSpacingChange,
  onAutoSizeChange,
  onFormatChange,
  onQualityChange,
}) => {
  return (
    <div className="space-y-5">
      {/* 图片模式选择 */}
      <div className="space-y-3">
        <Label className="text-gray-300">
          <span className="bg-tool-primary/20 border border-tool-primary/40 rounded px-1.5 py-0.5 text-xs text-tool-primary mr-2">
            图片模式
          </span>
        </Label>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>保持图片原始尺寸</span>
            {autoSize && <Badge variant="outline" className="bg-tool-primary/10 text-[10px]">推荐</Badge>}
          </div>
          <Switch
            checked={autoSize}
            onCheckedChange={onAutoSizeChange}
            className="data-[state=checked]:bg-tool-primary"
          />
        </div>
        <p className="text-gray-500 text-xs">
          {autoSize 
            ? "每张图片保持原始尺寸，适合不同尺寸图片" 
            : "所有图片调整为相同尺寸，整体效果更统一"}
        </p>
      </div>

      <Separator className="bg-gray-800" />

      {/* 布局设置 */}
      {layout === "grid" && (
        <div className="space-y-3">
          <Label className="text-gray-300">
            <span className="bg-tool-primary/20 border border-tool-primary/40 rounded px-1.5 py-0.5 text-xs text-tool-primary mr-2">
              网格布局
            </span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">行数</Label>
              <Select
                value={rows.toString()}
                onValueChange={(value) => onRowsChange(parseInt(value))}
              >
                <SelectTrigger className="border-gray-700 bg-black/50 text-white">
                  <SelectValue placeholder="选择行数" />
                </SelectTrigger>
                <SelectContent className="bg-black border border-gray-700">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">列数</Label>
              <Select
                value={columns.toString()}
                onValueChange={(value) => onColumnsChange(parseInt(value))}
              >
                <SelectTrigger className="border-gray-700 bg-black/50 text-white">
                  <SelectValue placeholder="选择列数" />
                </SelectTrigger>
                <SelectContent className="bg-black border border-gray-700">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* 间距设置 */}
      <div className="space-y-3">
        <Label className="text-gray-300 flex justify-between items-center">
          <span className="bg-tool-primary/20 border border-tool-primary/40 rounded px-1.5 py-0.5 text-xs text-tool-primary">
            图片间距
          </span>
          <span className="text-sm text-gray-400">{spacing}px</span>
        </Label>
        <Slider
          value={[spacing]}
          min={0}
          max={50}
          step={1}
          onValueChange={(values) => onSpacingChange(values[0])}
          className="py-4"
        />
      </div>

      <Separator className="bg-gray-800" />

      {/* 输出设置 */}
      <div className="space-y-3">
        <Label className="text-gray-300">
          <span className="bg-tool-primary/20 border border-tool-primary/40 rounded px-1.5 py-0.5 text-xs text-tool-primary mr-2">
            输出格式
          </span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-400">格式</Label>
            <Select
              value={format}
              onValueChange={onFormatChange}
            >
              <SelectTrigger className="border-gray-700 bg-black/50 text-white">
                <SelectValue placeholder="选择格式" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-gray-700">
                <SelectItem value="png">PNG (高质量)</SelectItem>
                <SelectItem value="jpeg">JPEG (小体积)</SelectItem>
                <SelectItem value="webp">WebP (高压缩率)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {format !== "png" && (
            <div className="space-y-3">
              <Label className="text-xs text-gray-400 flex justify-between">
                <span>质量</span>
                <span>{quality}%</span>
              </Label>
              <Slider
                value={[quality]}
                min={10}
                max={100}
                step={5}
                onValueChange={(values) => onQualityChange(values[0])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;
