import React, { useState } from 'react';
import { ArrowRight, Circle, GitBranch, Code2, Download, Network } from 'lucide-react';
import { CallGraph } from './CallGraph';

interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type: 'function' | 'class' | 'method' | 'arrow';
}

interface CallData {
  from: string;
  to: string;
  lineNumber?: number;
  context?: string;
}

interface FunctionVisualizerProps {
  functions: FunctionData[];
  calls: CallData[];
  language: string;
}

const functionColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function FunctionVisualizer({ functions, calls, language }: FunctionVisualizerProps) {
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const getColorForFunction = (index: number) => {
    return functionColors[index % functionColors.length];
  };

  const getFunctionCalls = (functionName: string) => {
    return calls.filter(call => call.from === functionName);
  };

  const getCalledBy = (functionName: string) => {
    return calls.filter(call => call.to === functionName);
  };

  const handleExport = () => {
    const data = {
      language,
      functions,
      calls,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
      <div className="bg-[#161b22] border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <GitBranch className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Function Analysis</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d1117] rounded p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Network className="w-3 h-3" />
              Graph
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={functions.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="text-sm text-gray-400">
            {functions.length} function{functions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {functions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <Code2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-center">
              No functions detected yet.
              <br />
              <span className="text-sm">Start typing or paste code to analyze.</span>
            </p>
          </div>
        ) : viewMode === 'graph' ? (
          <CallGraph
            functions={functions}
            calls={calls}
            getColorForFunction={getColorForFunction}
          />
        ) : (
          <div className="p-6 space-y-6">
            {/* Function List */}
            <div>
              <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
                Functions & Methods
              </h3>
              <div className="space-y-3">
                {functions.map((func, index) => (
                  <div
                    key={`${func.name}-${index}`}
                    onClick={() => setSelectedFunction(func.name)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedFunction === func.name
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-800 bg-[#161b22] hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Circle
                        className="w-3 h-3 mt-1 flex-shrink-0"
                        fill={getColorForFunction(index)}
                        color={getColorForFunction(index)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-sm" style={{ color: getColorForFunction(index) }}>
                            {func.name}
                          </code>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                            {func.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          Line {func.lineNumber} • {func.params.length} parameter{func.params.length !== 1 ? 's' : ''}
                        </div>
                        {func.params.length > 0 && (
                          <div className="text-xs text-gray-500 font-mono">
                            ({func.params.join(', ')})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show calls if function is selected */}
                    {selectedFunction === func.name && (
                      <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                        {getFunctionCalls(func.name).length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Calls:</div>
                            <div className="space-y-1.5">
                              {getFunctionCalls(func.name).map((call, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <ArrowRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <code className="text-green-400">{call.to}</code>
                                    {call.lineNumber && (
                                      <span className="text-gray-600 ml-2">on line {call.lineNumber}</span>
                                    )}
                                    {call.context && (
                                      <div className="text-gray-500 font-mono mt-1 bg-[#0d1117] p-1.5 rounded text-xs overflow-x-auto">
                                        {call.context}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {getCalledBy(func.name).length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Called by:</div>
                            <div className="space-y-1.5">
                              {getCalledBy(func.name).map((call, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <ArrowRight className="w-3 h-3 text-blue-500 rotate-180 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <code className="text-blue-400">{call.from}</code>
                                    {call.lineNumber && (
                                      <span className="text-gray-600 ml-2">on line {call.lineNumber}</span>
                                    )}
                                    {call.context && (
                                      <div className="text-gray-500 font-mono mt-1 bg-[#0d1117] p-1.5 rounded text-xs overflow-x-auto">
                                        {call.context}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {getFunctionCalls(func.name).length === 0 && getCalledBy(func.name).length === 0 && (
                          <div className="text-xs text-gray-600 italic">
                            No function calls detected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Call Graph Summary */}
            {calls.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
                  Call Relationships
                </h3>
                <div className="border border-gray-800 bg-[#161b22] rounded-lg p-4 space-y-3">
                  {calls.map((call, index) => {
                    const fromIndex = functions.findIndex(f => f.name === call.from);
                    const toIndex = functions.findIndex(f => f.name === call.to);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          <code style={{ color: fromIndex >= 0 ? getColorForFunction(fromIndex) : '#6b7280' }}>
                            {call.from}
                          </code>
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                          <code style={{ color: toIndex >= 0 ? getColorForFunction(toIndex) : '#6b7280' }}>
                            {call.to}
                          </code>
                          {call.lineNumber && (
                            <span className="text-xs text-gray-600">Line {call.lineNumber}</span>
                          )}
                        </div>
                        {call.context && (
                          <div className="text-xs text-gray-500 font-mono bg-[#0d1117] p-2 rounded ml-6 overflow-x-auto">
                            {call.context}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}