import React, { useState } from "react";
import { Circle, ChevronDown } from "lucide-react";

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
}

export function FunctionLegend({
  functions,
  getColorForFunction,
  onFunctionClick,
}: FunctionLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (functions.length === 0) return null;

  return (
    <div className="absolute right-4 bottom-4 bg-[#1c2128] border border-gray-700 rounded shadow-xl z-50 w-[160px] text-[11px]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b border-gray-700 cursor-pointer hover:bg-[#21262d] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2" />
          <span className="text-[11px] font-medium text-gray-300">
            Functions
          </span>
        </div>
        <ChevronDown
          className={`w-2.5 h-2.5 text-gray-400 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
      </div>

      {/* Function List */}
      {isExpanded && (
        <div className="max-h-[250px] overflow-y-auto">
          {functions.map((func, index) => (
            <button
              key={`${func.name}-${index}`}
              onClick={() => onFunctionClick(func.name)}
              className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-[#21262d] transition-colors text-left border-b border-gray-800 last:border-b-0"
            >
              <Circle
                className="w-2 h-2 flex-shrink-0"
                fill={getColorForFunction(index)}
                stroke="none"
              />
              <span className="text-[11px] text-gray-300 truncate flex-1">
                {func.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Styling */}
      <style>{`
        .max-h-\\[250px\\]::-webkit-scrollbar {
          width: 6px;
        }
        .max-h-\\[250px\\]::-webkit-scrollbar-track {
          background: #161b22;
        }
        .max-h-\\[250px\\]::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 3px;
        }
        .max-h-\\[250px\\]::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}
