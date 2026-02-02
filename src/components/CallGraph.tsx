import React, { useCallback, useEffect } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type: 'function' | 'class' | 'method' | 'arrow';
}

interface CallData {
  from: string;
  to: string;
}

interface CallGraphProps {
  functions: FunctionData[];
  calls: CallData[];
  getColorForFunction: (index: number) => string;
}

export function CallGraph({ functions, calls, getColorForFunction }: CallGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Create nodes from functions
    const newNodes: Node[] = functions.map((func, index) => {
      const color = getColorForFunction(index);
      
      // Calculate position in a circular or grid layout
      const angle = (index / functions.length) * 2 * Math.PI;
      const radius = Math.max(200, functions.length * 30);
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      return {
        id: func.name,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div className="px-3 py-2">
              <div className="font-mono font-semibold mb-1">{func.name}</div>
              <div className="text-xs text-gray-400">
                {func.type} • Line {func.lineNumber}
              </div>
              {func.params.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  ({func.params.slice(0, 2).join(', ')}
                  {func.params.length > 2 ? '...' : ''})
                </div>
              )}
            </div>
          ),
        },
        style: {
          background: '#161b22',
          border: `2px solid ${color}`,
          borderRadius: '8px',
          color: '#e6edf3',
          fontSize: '12px',
          minWidth: '140px',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    // Create edges from calls
    const newEdges: Edge[] = calls.map((call, index) => {
      const fromIndex = functions.findIndex(f => f.name === call.from);
      const color = fromIndex >= 0 ? getColorForFunction(fromIndex) : '#6b7280';

      return {
        id: `${call.from}-${call.to}-${index}`,
        source: call.from,
        target: call.to,
        animated: true,
        style: { stroke: color, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
          width: 20,
          height: 20,
        },
        type: 'smoothstep',
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [functions, calls, getColorForFunction, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#0d1117]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        className="bg-[#0d1117]"
      >
        <Background color="#21262d" gap={16} />
        <Controls className="bg-[#161b22] border border-gray-800 rounded" />
        <MiniMap
          className="bg-[#161b22] border border-gray-800 rounded"
          nodeColor={(node) => {
            const index = functions.findIndex(f => f.name === node.id);
            return index >= 0 ? getColorForFunction(index) : '#6b7280';
          }}
          maskColor="rgba(13, 17, 23, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
