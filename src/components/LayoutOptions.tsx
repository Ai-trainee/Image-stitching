import React from "react";
import { cn } from "@/lib/utils";
import { Grid, Rows, Square } from "lucide-react";

interface LayoutOptionsProps {
  selectedLayout: "single" | "row" | "grid";
  onSelectLayout: (layout: "single" | "row" | "grid") => void;
}

const LayoutOptions: React.FC<LayoutOptionsProps> = ({
  selectedLayout,
  onSelectLayout,
}) => {
  return (
    <div>
      <h3 className="text-tool-primary/90 text-sm font-medium mb-3">拼接模式</h3>
      <div className="grid grid-cols-3 gap-3">
        <div
          className={cn(
            "cursor-pointer rounded-lg border border-tool-border/30 bg-black transition-all duration-200 overflow-hidden",
            {
              "border-tool-primary shadow-[0_0_8px_rgba(0,230,230,0.25)] scale-[1.02]": selectedLayout === "single",
            }
          )}
          onClick={() => onSelectLayout("single")}
        >
          <div className="w-full h-14 flex flex-col items-center justify-center gap-1 p-2">
            <Square 
              size={22} 
              className={cn(
                "transition-colors", 
                selectedLayout === "single" ? "text-tool-primary" : "text-gray-500"
              )} 
            />
            <span className={cn(
              "text-xs transition-colors", 
              selectedLayout === "single" ? "text-tool-primary" : "text-gray-400"
            )}>横排</span>
          </div>
        </div>

        <div
          className={cn(
            "cursor-pointer rounded-lg border border-tool-border/30 bg-black transition-all duration-200 overflow-hidden",
            {
              "border-tool-primary shadow-[0_0_8px_rgba(0,230,230,0.25)] scale-[1.02]": selectedLayout === "row",
            }
          )}
          onClick={() => onSelectLayout("row")}
        >
          <div className="w-full h-14 flex flex-col items-center justify-center gap-1 p-2">
            <Rows 
              size={22} 
              className={cn(
                "transition-colors", 
                selectedLayout === "row" ? "text-tool-primary" : "text-gray-500"
              )} 
            />
            <span className={cn(
              "text-xs transition-colors", 
              selectedLayout === "row" ? "text-tool-primary" : "text-gray-400"
            )}>单列</span>
          </div>
        </div>

        <div
          className={cn(
            "cursor-pointer rounded-lg border border-tool-border/30 bg-black transition-all duration-200 overflow-hidden",
            {
              "border-tool-primary shadow-[0_0_8px_rgba(0,230,230,0.25)] scale-[1.02]": selectedLayout === "grid",
            }
          )}
          onClick={() => onSelectLayout("grid")}
        >
          <div className="w-full h-14 flex flex-col items-center justify-center gap-1 p-2">
            <Grid 
              size={22} 
              className={cn(
                "transition-colors", 
                selectedLayout === "grid" ? "text-tool-primary" : "text-gray-500"
              )} 
            />
            <span className={cn(
              "text-xs transition-colors", 
              selectedLayout === "grid" ? "text-tool-primary" : "text-gray-400"
            )}>网格</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutOptions;
