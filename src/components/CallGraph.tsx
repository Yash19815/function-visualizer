import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type: "function" | "class" | "method" | "arrow";
}

interface CallData {
  from: string;
  to: string;
}

interface CallSiteNode {
  id: string;
  callerName: string;
  calleeName: string;
  lineNumber: number;
  context?: string;
}

interface CallGraphProps {
  functions: FunctionData[];
  calls: CallData[];
  callSites: CallSiteNode[];
  getColorForFunction: (index: number) => string;
}

export function CallGraph({
  functions,
  calls,
  callSites,
  getColorForFunction,
}: CallGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Group call sites by their callee (function being called)
    const callSitesByCallee = new Map<string, CallSiteNode[]>();
    callSites.forEach((cs) => {
      if (!callSitesByCallee.has(cs.calleeName)) {
        callSitesByCallee.set(cs.calleeName, []);
      }
      callSitesByCallee.get(cs.calleeName)!.push(cs);
    });

    const functionNodes: Node[] = [];
    const callSiteNodes: Node[] = [];
    const horizontalSpacing = 300;

    functions.forEach((func, funcIndex) => {
      const color = getColorForFunction(funcIndex);
      const sitesForThisFunction = callSitesByCallee.get(func.name) || [];

      // Calculate horizontal position
      const baseX = funcIndex * horizontalSpacing + 150;

      // Function always at the top
      const functionY = 100;

      // Call sites positioned below the function, spread vertically
      const callSiteStartY = 300;
      const callSiteVerticalSpacing = 200;

      // Group call sites by line number to handle multiple calls on same line
      const callsByLine = new Map<number, CallSiteNode[]>();
      sitesForThisFunction.forEach((callSite) => {
        if (!callsByLine.has(callSite.lineNumber)) {
          callsByLine.set(callSite.lineNumber, []);
        }
        callsByLine.get(callSite.lineNumber)!.push(callSite);
      });

      // Create call site nodes (one per unique line)
      let nodeIndex = 0;
      callsByLine.forEach((callsOnLine, lineNumber) => {
        const y = callSiteStartY + nodeIndex * callSiteVerticalSpacing;

        // Get colors for all functions called on this line
        const colors = callsOnLine.map((cs) => {
          const calleeIndex = functions.findIndex(
            (f) => f.name === cs.calleeName,
          );
          return calleeIndex >= 0
            ? getColorForFunction(calleeIndex)
            : "#6b7280";
        });

        // Create border/background style for single or multiple calls
        let nodeStyle: any;

        if (colors.length === 1) {
          // Single function call: solid border
          nodeStyle = {
            background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
            border: `1.5px solid ${colors[0]}`,
            borderRadius: "8px",
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px ${colors[0]}15`,
          };
        } else {
          // Multiple function calls: gradient border using linear-gradient background trick
          // Create gradient stops for border effect
          const segmentSize = 100 / colors.length;
          const gradientStops = colors
            .flatMap((color, idx) => {
              const start = idx * segmentSize;
              const end = (idx + 1) * segmentSize;
              return [`${color} ${start}%`, `${color} ${end}%`];
            })
            .join(", ");

          nodeStyle = {
            // Use a gradient background for the border effect
            background: `
              linear-gradient(135deg, #0d1117 0%, #161b22 100%) padding-box,
              linear-gradient(90deg, ${gradientStops}) border-box
            `,
            border: "2px solid transparent",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          };
        }

        // Use first call site's ID for the node
        const nodeId = callsOnLine[0].id;
        const functionNames = callsOnLine
          .map((cs) => cs.calleeName)
          .join(" + ");

        callSiteNodes.push({
          id: nodeId,
          type: "default",
          position: { x: baseX, y },
          data: {
            label: (
              <div className="px-3 py-2 text-center">
                <div className="text-xs font-semibold text-gray-300">
                  {colors.length > 1 ? `${colors.length} Calls` : "Call"}
                </div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">
                  L{lineNumber}
                </div>
              </div>
            ),
            // Store all call sites for edge creation
            callSites: callsOnLine,
          },
          style: {
            ...nodeStyle,
            color: "#e6edf3",
            fontSize: "10px",
            minWidth: colors.length > 1 ? "80px" : "65px",
            maxWidth: colors.length > 1 ? "80px" : "65px",
            opacity: 0.95,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        nodeIndex++;
      });

      // Create function definition node
      functionNodes.push({
        id: func.name,
        type: "default",
        position: { x: baseX, y: functionY },
        data: {
          label: (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="font-mono font-bold text-sm">{func.name}</div>
              </div>
              <div className="text-xs text-gray-400">
                {func.type} • Line {func.lineNumber}
              </div>
              {func.params.length > 0 && (
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  ({func.params.slice(0, 3).join(", ")}
                  {func.params.length > 3 ? "..." : ""})
                </div>
              )}
            </div>
          ),
        },
        style: {
          background: "linear-gradient(135deg, #161b22 0%, #1c2128 100%)",
          border: `2px solid ${color}`,
          borderRadius: "12px",
          color: "#e6edf3",
          fontSize: "12px",
          minWidth: "160px",
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px ${color}20`,
          zIndex: 10, // Ensure function nodes are above call sites
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    const allNodes = [...functionNodes, ...callSiteNodes];

    // Create edges - handle nodes that may contain multiple call sites
    const callEdges: Edge[] = [];

    callSiteNodes.forEach((node) => {
      const callSitesInNode = node.data.callSites as CallSiteNode[];

      callSitesInNode.forEach((callSite) => {
        const calleeIndex = functions.findIndex(
          (f) => f.name === callSite.calleeName,
        );
        const color =
          calleeIndex >= 0 ? getColorForFunction(calleeIndex) : "#6b7280";

        // Create edge from call site node to callee definition
        callEdges.push({
          id: `${node.id}-${callSite.calleeName}-${callSite.id}`,
          source: node.id,
          target: callSite.calleeName,
          animated: true,
          style: {
            stroke: color,
            strokeWidth: 2.5,
            opacity: 0.8,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: color,
            width: 18,
            height: 18,
          },
          type: "smoothstep",
        });
      });
    });

    setNodes(allNodes);
    setEdges(callEdges);
  }, [functions, calls, callSites, getColorForFunction, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#0d1117]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        className="bg-[#0d1117]"
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#21262d" gap={20} size={1} />
        <Controls
          className="bg-[#161b22] border border-gray-700 rounded-lg shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-[#0d1117] border border-gray-700 rounded-lg shadow-lg"
          style={{
            backgroundColor: "#0d1117",
          }}
          nodeColor={(node: any) => {
            // Check if it's a call site node
            if (node.id.startsWith("call_")) {
              const callSite = callSites.find((cs) => cs.id === node.id);
              if (callSite) {
                // Use the CALLEE's color (function being called)
                const calleeIndex = functions.findIndex(
                  (f) => f.name === callSite.calleeName,
                );
                return calleeIndex >= 0
                  ? getColorForFunction(calleeIndex)
                  : "#6b7280";
              }
            }
            // It's a function definition node
            const index = functions.findIndex((f) => f.name === node.id);
            return index >= 0 ? getColorForFunction(index) : "#6b7280";
          }}
          maskColor="rgba(13, 17, 23, 0.9)"
          nodeStrokeWidth={3}
        />
      </ReactFlow>
    </div>
  );
}
