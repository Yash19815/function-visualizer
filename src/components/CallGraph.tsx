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
    const horizontalSpacing = 700;

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

      // Position call sites
      sitesForThisFunction.forEach((callSite, siteIndex) => {
        const calleeIndex = functions.findIndex(
          (f) => f.name === callSite.calleeName,
        );
        const siteColor =
          calleeIndex >= 0 ? getColorForFunction(calleeIndex) : "#6b7280";

        // Spread call sites vertically
        const y = callSiteStartY + siteIndex * callSiteVerticalSpacing;

        callSiteNodes.push({
          id: callSite.id,
          type: "default",
          position: { x: baseX, y },
          data: {
            label: (
              <div className="px-3 py-2 text-center">
                <div className="text-xs font-semibold text-gray-300">Call</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">
                  L{callSite.lineNumber}
                </div>
              </div>
            ),
          },
          style: {
            background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
            border: `1.5px solid ${siteColor}`,
            borderRadius: "8px",
            color: "#e6edf3",
            fontSize: "10px",
            minWidth: "65px",
            maxWidth: "65px",
            opacity: 0.95,
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px ${siteColor}15`,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
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

    // Create edges
    const callEdges: Edge[] = callSites.flatMap((callSite) => {
      const calleeIndex = functions.findIndex(
        (f) => f.name === callSite.calleeName,
      );
      const color =
        calleeIndex >= 0 ? getColorForFunction(calleeIndex) : "#6b7280";

      const edges: Edge[] = [];

      // Edge from caller definition to call site (if not global)
      if (callSite.callerName !== "global") {
        edges.push({
          id: `${callSite.callerName}-${callSite.id}`,
          source: callSite.callerName,
          target: callSite.id,
          animated: false,
          style: {
            stroke: color,
            strokeWidth: 1.5,
            opacity: 0.4,
            strokeDasharray: "5,5",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: color,
            width: 12,
            height: 12,
          },
          type: "smoothstep",
        });
      }

      // Edge from call site to callee definition (main edge)
      edges.push({
        id: `${callSite.id}-${callSite.calleeName}`,
        source: callSite.id,
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

      return edges;
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
