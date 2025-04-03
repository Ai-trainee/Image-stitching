import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlignCenter, GridIcon, AlignJustify, Rows3 } from "lucide-react";

interface LayoutOptionsProps {
  selectedLayout: "single" | "row" | "grid";
  onSelectLayout: (layout: "single" | "row" | "grid") => void;
}

const LayoutOptions: React.FC<LayoutOptionsProps> = ({
  selectedLayout,
  onSelectLayout,
}) => {
  const layouts = [
    {
      type: "single" as const,
      label: "单幅",
      icon: <AlignCenter size={22} className="mb-1" />,
      description: "只显示一张图片"
    },
    {
      type: "row" as const,
      label: "单列",
      icon: <Rows3 size={22} className="mb-1" />,
      description: "图片垂直排列"
    },
    {
      type: "grid" as const,
      label: "网格",
      icon: <GridIcon size={22} className="mb-1" />,
      description: "图片网格排列"
    },
  ];

  return (
    <div>
      <h3 className="text-tool-primary font-medium text-sm mb-4">拼接模式</h3>
      <div className="grid grid-cols-3 gap-3">
        {layouts.map((layout) => (
          <div
            key={layout.type}
            className={cn(
              "rounded-md border cursor-pointer transition-all duration-300",
              "flex flex-col items-center justify-center py-3 text-center",
              selectedLayout === layout.type
                ? "bg-tool-primary/30 border-2 border-tool-primary text-white"
                : "bg-black/40 border-tool-border/40 text-gray-300 hover:border-tool-primary/70 hover:bg-tool-primary/10"
            )}
            onClick={() => onSelectLayout(layout.type)}
          >
            {layout.icon}
            <span className="text-sm font-medium">{layout.label}</span>
            <span className="text-[10px] text-gray-400 mt-0.5 px-1">{layout.description}</span>
            
            {/* 布局预览图 */}
            <div className="mt-2 relative">
              {layout.type === "single" && (
                <div className="w-8 h-8 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
              )}
              
              {layout.type === "row" && (
                <div className="flex flex-col gap-1">
                  <div className="w-8 h-2 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                  <div className="w-8 h-2 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                  <div className="w-8 h-2 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                </div>
              )}
              
              {layout.type === "grid" && (
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3.5 h-3.5 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                  <div className="w-3.5 h-3.5 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                  <div className="w-3.5 h-3.5 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                  <div className="w-3.5 h-3.5 bg-tool-primary/20 border border-tool-primary/40 rounded-sm"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutOptions;
