import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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

// 公众号常用尺寸提示
const WeChatSizeTooltip = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          <Info size={12} className="text-tool-primary ml-1" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="text-xs">公众号建议:<br/>- 文章宽度: 900px<br/>- 封面图: 900×383px</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

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
      {/* 图片模式 */}
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-tool-primary font-medium text-sm">图片模式</h3>
          <WeChatSizeTooltip />
        </div>
        <div className="flex gap-2">
          <div 
            className={`flex-1 rounded-md cursor-pointer transition-all duration-300 
                        ${autoSize ? 'bg-tool-primary/30 border-2 border-tool-primary text-white font-medium' : 'bg-black/40 border border-tool-border/40 text-gray-300'} 
                        p-2 text-center text-sm hover:border-tool-primary/70 hover:bg-tool-primary/10`}
            onClick={() => onAutoSizeChange(true)}
          >
            <div className="flex items-center justify-center">
              <span className="mr-1">保持原尺寸</span>
              {autoSize && (
                <svg viewBox="0 0 24 24" width="14" height="14" className="fill-tool-primary ml-1">
                  <path d="M9 16.17l-4.17-4.17-1.41 1.41 5.58 5.59 12-12-1.41-1.41z" />
                </svg>
              )}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">原始尺寸不缩放</div>
          </div>
          
          <div 
            className={`flex-1 rounded-md cursor-pointer transition-all duration-300 
                        ${!autoSize ? 'bg-tool-primary/30 border-2 border-tool-primary text-white font-medium' : 'bg-black/40 border border-tool-border/40 text-gray-300'} 
                        p-2 text-center text-sm hover:border-tool-primary/70 hover:bg-tool-primary/10`}
            onClick={() => onAutoSizeChange(false)}
          >
            <div className="flex items-center justify-center">
              <span className="mr-1">统一尺寸</span>
              {!autoSize && (
                <svg viewBox="0 0 24 24" width="14" height="14" className="fill-tool-primary ml-1">
                  <path d="M9 16.17l-4.17-4.17-1.41 1.41 5.58 5.59 12-12-1.41-1.41z" />
                </svg>
              )}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">调整为相同尺寸</div>
          </div>
        </div>
      </div>

      {/* 布局选项 */}
      {layout !== "single" && (
        <div className="grid grid-cols-2 gap-3">
          {layout === "grid" && (
            <div>
              <div className="text-gray-400 text-sm mb-2 flex items-center">
                行数
                {layout === "grid" && (
                  <div className="text-xs text-tool-primary ml-1.5">{rows}行</div>
                )}
              </div>
              <Select
                value={rows.toString()}
                onValueChange={(value) => onRowsChange(parseInt(value))}
              >
                <SelectTrigger className="bg-tool-secondary border-gray-700 text-white h-9">
                  <SelectValue placeholder="2" />
                </SelectTrigger>
                <SelectContent className="bg-tool-secondary border-gray-700 text-white">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {layout === "grid" && (
            <div>
              <div className="text-gray-400 text-sm mb-2 flex items-center">
                列数
                {layout === "grid" && (
                  <div className="text-xs text-tool-primary ml-1.5">{columns}列</div>
                )}
              </div>
              <Select
                value={columns.toString()}
                onValueChange={(value) => onColumnsChange(parseInt(value))}
              >
                <SelectTrigger className="bg-tool-secondary border-gray-700 text-white h-9">
                  <SelectValue placeholder="2" />
                </SelectTrigger>
                <SelectContent className="bg-tool-secondary border-gray-700 text-white">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className={layout === "grid" ? "col-span-2" : "col-span-2"}>
            <div className="text-gray-400 text-sm mb-2 flex items-center">
              间距
              <div className="text-xs text-tool-primary ml-1.5">{spacing}px</div>
            </div>
            <Select
              value={spacing.toString()}
              onValueChange={(value) => onSpacingChange(parseInt(value))}
            >
              <SelectTrigger className="bg-tool-secondary border-gray-700 text-white h-9">
                <SelectValue placeholder="0" />
              </SelectTrigger>
              <SelectContent className="bg-tool-secondary border-gray-700 text-white">
                {[0, 5, 10, 15, 20, 30].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 输出格式 */}
      <div className="space-y-3">
        <div className="text-gray-400 text-sm flex items-center">
          输出格式
          <div className="text-xs text-tool-primary ml-1.5">{format.toUpperCase()}</div>
        </div>
        
        <div className="flex gap-2">
          {["png", "jpeg", "webp"].map((fmt) => (
            <div
              key={fmt}
              className={`flex-1 rounded-md cursor-pointer transition-all duration-200 
                          ${format === fmt ? 'bg-tool-primary/30 border-2 border-tool-primary text-white' : 'bg-black/40 border border-tool-border/40 text-gray-300'} 
                          py-1.5 px-2 text-center text-xs hover:border-tool-primary/70 hover:bg-tool-primary/10`}
              onClick={() => onFormatChange(fmt)}
            >
              <div className="font-medium">{fmt.toUpperCase()}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">
                {fmt === 'png' ? '无损' : fmt === 'jpeg' ? '有损' : '高压缩'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 质量滑块 - 仅对有损格式显示 */}
      {format !== "png" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">画质</span>
            <span className="text-xs bg-tool-primary/20 text-tool-primary px-1.5 py-0.5 rounded">{quality}%</span>
          </div>
          <div className="px-1">
            <Slider
              value={[quality]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => onQualityChange(value[0])}
              className="bg-transparent"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
              <span>低画质</span>
              <span>高画质</span>
            </div>
          </div>
        </div>
      )}

      {/* 公众号优化提示 */}
      {!autoSize && (
        <div className="bg-tool-primary/10 rounded-md p-2 text-xs border border-tool-primary/30">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-tool-primary mr-1.5"></div>
            <span className="text-tool-primary font-medium">公众号最佳尺寸提示</span>
          </div>
          <div className="mt-1 text-gray-300 pl-3.5">
            <div>• 文章正文图片: 宽度900px</div>
            <div>• 封面图片: 900×383px</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsPanel;
