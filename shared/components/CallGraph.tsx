import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  Position,
} from "reactflow";
import dagre from "dagre";

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

export interface CallGraphRef {
  exportAsJpeg: () => Promise<void>;
  getImageData: () => Promise<string>;
  focusNode: (nodeName: string) => void;
}

const CallGraphInner = forwardRef<CallGraphRef, CallGraphProps>(
  ({ functions, calls, callSites, getColorForFunction }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useImperativeHandle(ref, () => ({
      exportAsJpeg: async () => {
        console.log("Export not implemented yet");
      },
      getImageData: async () => {
        return "";
      },
      focusNode: (nodeName: string) => {
        console.log("Focus node:", nodeName);
      },
    }));

    useEffect(() => {
      console.log("[CallGraph] Building ReactFlow graph with:", {
        functionsCount: functions.length,
        callsCount: calls.length,
        callSitesCount: callSites.length,
      });

      console.log(
        "[CallGraph] Call sites data:",
        callSites.map((site) => ({
          id: site.id,
          caller: site.callerName,
          callee: site.calleeName,
          line: site.lineNumber,
        })),
      );

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 50 });

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Add function nodes
      functions.forEach((func, index) => {
        const color = getColorForFunction(index);
        const nodeId = `func_${func.name}`;

        newNodes.push({
          id: nodeId,
          type: "default",
          data: {
            label: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "600", fontSize: "13px" }}>
                  {func.name}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.8 }}>
                  {func.type} • Line {func.lineNumber}
                </div>
                {func.params.length > 0 && (
                  <div style={{ fontSize: "9px", opacity: 0.6 }}>
                    ({func.params.join(", ")})
                  </div>
                )}
              </div>
            ),
          },
          position: { x: 0, y: 0 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: color,
            color: "#1f2937",
            border: `2px solid ${color}`,
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "12px",
            fontWeight: "500",
            minWidth: 180,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
          },
        });

        dagreGraph.setNode(nodeId, { width: 200, height: 80 });
      });

      // Add call site nodes (small boxes showing line numbers)
      callSites.forEach((site) => {
        const callSiteId = `call_${site.id}`;

        newNodes.push({
          id: callSiteId,
          type: "default",
          data: {
            label: `Call\nL${site.lineNumber}`,
          },
          position: { x: 0, y: 0 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: "#1f2937",
            color: "#9ca3af",
            border: "1px solid #4b5563",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "9px",
            fontWeight: "400",
            minWidth: 50,
            textAlign: "center",
            whiteSpace: "pre",
          },
        });

        dagreGraph.setNode(callSiteId, { width: 60, height: 40 });
      });

      // Add edges from caller to call site, and from call site to callee
      callSites.forEach((site) => {
        const fromId = `func_${site.callerName}`;
        const callSiteId = `call_${site.id}`;
        const toId = `func_${site.calleeName}`;

        // Check if target function exists
        const targetExists = functions.some((f) => f.name === site.calleeName);

        if (targetExists) {
          // Edge from caller to call site
          newEdges.push({
            id: `edge_${site.id}_from`,
            source: fromId,
            target: callSiteId,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: "#6b7280",
              strokeWidth: 2,
              strokeDasharray: "5,5",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6b7280",
            },
          });

          // Edge from call site to callee
          newEdges.push({
            id: `edge_${site.id}_to`,
            source: callSiteId,
            target: toId,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: "#6b7280",
              strokeWidth: 2,
              strokeDasharray: "5,5",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6b7280",
            },
          });

          dagreGraph.setEdge(fromId, callSiteId);
          dagreGraph.setEdge(callSiteId, toId);
        }
      });

      // Calculate layout
      dagre.layout(dagreGraph);

      // Apply positions from dagre
      newNodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (nodeWithPosition) {
          node.position = {
            x: nodeWithPosition.x - (nodeWithPosition.width || 100) / 2,
            y: nodeWithPosition.y - (nodeWithPosition.height || 50) / 2,
          };
        }
      });

      console.log(
        "[CallGraph] Created",
        newNodes.length,
        "nodes and",
        newEdges.length,
        "edges",
      );

      setNodes(newNodes);
      setEdges(newEdges);
    }, [functions, calls, callSites, getColorForFunction, setNodes, setEdges]);

    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          minHeight: "600px",
          background: "#0d1117",
          position: "relative",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          style={{
            width: "100%",
            height: "100%",
            background: "#0d1117",
          }}
        >
          <Background color="#374151" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    );
  },
);

CallGraphInner.displayName = "CallGraphInner";

// Wrap with ReactFlowProvider
const CallGraph = forwardRef<CallGraphRef, CallGraphProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <CallGraphInner {...props} ref={ref} />
    </ReactFlowProvider>
  );
});

CallGraph.displayName = "CallGraph";

export { CallGraph };
