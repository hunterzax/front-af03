"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useStoreApi,
  Position,
  Handle,
  ReactFlowProvider,
  NodeToolbar,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const NODE_WIDTH = 116;
const NODE_HEIGHT = 28;
const currentOverlapOffset = 0;
const nodeTypes = {
  nodeCustom: ({ data, isConnectable }: any) => {
    return (
      <div
        className={` w-[50px] h-[50px] grid items-center justify-center rounded-full`}
        style={{ border: `1px solid #515151` }}
      >
        <NodeToolbar position={Position.Top}>
          <button
            onClick={() => {
              data?.onFunc(data);
            }}
            className="text-[#515151] bg-[#ffffff] p-1 rounded-sm text-sm border-[1px] border-[#515151]"
          >
            Remove
          </button>
        </NodeToolbar>
        <div style={{ fontSize: "4px", color: `#515151` }}>
          {data?.label || "-"}
        </div>
        <Handle
          id="1"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
        />
        <Handle
          id="2"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{
            background: "#515151",
            width: "10px",
            height: "5px",
            borderRadius: "0",
          }}
        />
      </div>
    );
  },
};

const nodeDemo = [
  {
      "id": "Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1",
      "type": "",
      "label": "Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1",
      "backgroundColor": "#6ed5de",
      "data": {
          "id": "Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1",
          "label": "Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1"
      },
      "position": {
          "x": 439.5,
          "y": 194.5
      },
      "style": {
          "backgroundColor": "#6ed5de",
          "color": "#ffffff"
      },
      "className": "rounded-full",
      "measured": {
          "width": 150,
          "height": 76
      },
      "selected": false,
      "dragging": false
  },
  {
      "id": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2",
      "type": "nodeCustom",
      "label": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2",
      "backgroundColor": "#6ed5de",
      "data": {
          "id": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2",
          "label": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2"
      },
      "position": {
          "x": 638.5,
          "y": 213.5
      },
      "style": {
          "backgroundColor": "#6ed5de",
          "color": "#ffffff"
      },
      "className": "rounded-full",
      "measured": {
          "width": 50,
          "height": 50
      },
      "selected": false,
      "dragging": false
  },
  {
      "id": "Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A2",
      "type": "nodeCustom",
      "label": "Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A2",
      "backgroundColor": "#6ed5de",
      "data": {
          "id": "Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A2",
          "label": "Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A2"
      },
      "position": {
          "x": 754.5,
          "y": 214.5
      },
      "style": {
          "backgroundColor": "#6ed5de",
          "color": "#ffffff"
      },
      "className": "rounded-full",
      "measured": {
          "width": 50,
          "height": 50
      },
      "selected": true,
      "dragging": false
  }
]

const edgesDemo = [
  {
      "source": "Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1",
      "target": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2",
      "targetHandle": "2",
      "type": "",
      "markerEnd": {
          "type": "arrowclosed",
          "width": 20,
          "height": 20,
          "color": "#919191"
      },
      "style": {
          "strokeWidth": 1,
          "stroke": "#919191"
      },
      "id": "xy-edge__Thu Jul 25 2024 16:40:15 GMT+0700 (Indochina Time) A1-Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A22"
  },
  {
      "source": "Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A2",
      "sourceHandle": "1",
      "target": "Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A2",
      "targetHandle": "2",
      "type": "",
      "markerEnd": {
          "type": "arrowclosed",
          "width": 20,
          "height": 20,
          "color": "#919191"
      },
      "style": {
          "strokeWidth": 1,
          "stroke": "#919191"
      },
      "id": "xy-edge__Thu Jul 25 2024 16:40:20 GMT+0700 (Indochina Time) A21-Thu Jul 25 2024 16:40:33 GMT+0700 (Indochina Time) A22"
  }
]

const ContentFlow = () => {
  const store = useStoreApi();
  const [nodes, setNodes] = useState<any>(nodeDemo || []);
  const [edges, setEdges] = useState<any>(edgesDemo || []);

  const onConnect = useCallback(
    (params: any) => {
      params.type = "";
      params.markerEnd = {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#919191",
      };
      params.style = {
        strokeWidth: 1,
        stroke: "#919191",
      };
      setEdges((eds: any) => {
        return addEdge(params, eds);
      });
    },
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      return setNodes((nds: any) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      return setEdges((eds: any) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const addNode = async (payload: any) => {
    const {
      height,
      width,
      transform: [transformX, transformY, zoomLevel],
    } = store.getState();
    const zoomMultiplier = 1 / zoomLevel;
    const centerX = -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;
    const centerY =
      -transformY * zoomMultiplier + (height * zoomMultiplier) / 2;

    const nodeWidthOffset = NODE_WIDTH / 2;
    const nodeHeightOffset = NODE_HEIGHT / 2;

    payload.position = {
      x: centerX - nodeWidthOffset + currentOverlapOffset,
      y: centerY - nodeHeightOffset + currentOverlapOffset,
    };
    setNodes((pre: any) => [...pre, payload]);
  };

  const deleteNode = async (event: any) => {
    setNodes((pre: any) =>
      pre.filter((f: any) => {
        return f?.id !== event?.id;
      })
    );
    setEdges((pre: any) =>
      pre.filter((f: any) => {
        return f?.source !== event?.id && f?.target !== event?.id;
      })
    );
  };

  return (
    <div className=" w-[100%] h-[100%]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={[]}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Panel position="top-right">
          <>
            <div
              className=" cursor-pointer"
              onClick={() => {
                addNode({
                  id: `${new Date()} A1`,
                  type: "",
                  label: `${new Date()} A1`,
                  backgroundColor: "#6ed5de",
                  data: {
                    id: `${new Date()} A1`,
                    label: `${new Date()} A1`,
                    onFunc: deleteNode,
                  },
                  position: { x: 0, y: 0 },
                  style: {
                    backgroundColor: `#6ed5de`,
                    color: "#ffffff",
                  },
                  className: "rounded-full",
                });
              }}
            >{`Create Node`}</div>
            <div
              className=" cursor-pointer"
              onClick={() => {
                addNode({
                  id: `${new Date()} A2`,
                  type: "nodeCustom",
                  label: `${new Date()} A2`,
                  backgroundColor: "#6ed5de",
                  data: {
                    id: `${new Date()} A2`,
                    label: `${new Date()} A2`,
                    onFunc: deleteNode,
                  },
                  position: { x: 0, y: 0 },
                  style: {
                    backgroundColor: `#6ed5de`,
                    color: "#ffffff",
                  },
                  className: "rounded-full",
                });
              }}
            >{`Create Node Custom`}</div>
          </>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const ReactFlowLib = () => {
  return (
    <ReactFlowProvider>
      <ContentFlow />
    </ReactFlowProvider>
  );
};

export default ReactFlowLib;
