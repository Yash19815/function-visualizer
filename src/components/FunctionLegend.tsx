import { useState } from "react";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";

interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type?: string;
}

interface FunctionLegendProps {
  functions: FunctionData[];
  getColorForFunction: (index: number) => string;
  onFunctionClick: (functionName: string) => void;
  className?: string;
}

export function FunctionLegend({
  functions,
  getColorForFunction,
  onFunctionClick,
  className = "",
}: FunctionLegendProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!functions || functions.length === 0) {
    return null;
  }

  return (
    <div
      className={`absolute top-4 left-4 z-10 bg-[#1c2128] rounded-lg shadow-lg border border-gray-700 transition-all duration-300 ${className}`}
      style={{ maxWidth: "250px" }}
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#21262d] rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          <Circle className="w-4 h-4" />
          <span>Functions</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="p-3 pt-0 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {functions.map((func, index) => (
              <div
                key={`${func.name}-${index}`}
                className="flex items-center gap-2 group cursor-pointer hover:bg-[#21262d] p-1 -m-1 rounded ml-1"
                onClick={() => onFunctionClick(func.name)}
                title={`Jump to ${func.name}`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getColorForFunction(index) }}
                />
                <span className="text-xs text-gray-300 truncate">
                  {func.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #161b22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}
