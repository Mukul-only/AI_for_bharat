import { useState, useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Toaster, toast } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import SeedNode from "./nodes/SeedNode";
import PlatformNode from "./nodes/PlatformNode";
import ImageNode from "./nodes/ImageNode";
import ViralScoreNode from "./nodes/ViralScoreNode";
import { saveWorkspace, loadWorkspace } from "./api";
import { Workflow } from "lucide-react";

// Workspace ID (simple — in production, use auth)
const WORKSPACE_ID = "default";

// Register custom node types
const nodeTypes = {
  seed: SeedNode,
  twitter: PlatformNode,
  linkedin: PlatformNode,
  instagram: PlatformNode,
  blog: PlatformNode,
  image: ImageNode,
  viralScore: ViralScoreNode,
};

// Default edge options
const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#8b5cf6", strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#8b5cf6",
  },
};

// Node creation helpers
let nodeIdCounter = 0;
function getNextId() {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}

function createNodeData(type) {
  const base = { text: "", output: "" };
  switch (type) {
    case "seed":
      return { ...base, onTextChange: null }; // Will be set in App
    case "twitter":
      return { ...base, platform: "twitter", tone: 50, length: "medium" };
    case "linkedin":
      return { ...base, platform: "linkedin", tone: 30, length: "medium" };
    case "instagram":
      return { ...base, platform: "instagram", tone: 70, length: "short" };
    case "blog":
      return { ...base, platform: "blog", tone: 40, length: "long" };
    case "image":
      return { ...base, style: "photorealistic", imageUrl: "" };
    case "viralScore":
      return { ...base, scoreData: null };
    default:
      return base;
  }
}

// Initial demo nodes
const initialNodes = [
  {
    id: "seed-1",
    type: "seed",
    position: { x: 50, y: 200 },
    data: {
      text: "",
      onTextChange: null,
    },
  },
];

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("My Content Workspace");

  // Callback to update seed node text in parent state
  const handleSeedTextChange = useCallback(
    (nodeId, text) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, text } };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  // Callback to update platform node output in parent state
  const handleOutputChange = useCallback(
    (nodeId, output) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, output } };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  // Callback to update image node URL in parent state
  const handleImageChange = useCallback(
    (nodeId, imageUrl) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, imageUrl } };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  // Inject callbacks into node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => {
      const data = { ...n.data };
      if (n.type === "seed") {
        data.onTextChange = handleSeedTextChange;
      }
      if (["twitter", "linkedin", "instagram", "blog"].includes(n.type)) {
        data.onOutputChange = handleOutputChange;
      }
      if (n.type === "image") {
        data.onImageChange = handleImageChange;
      }
      return { ...n, data };
    });
  }, [nodes, handleSeedTextChange, handleOutputChange, handleImageChange]);

  // Connect nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Handle drag-and-drop from sidebar
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getNextId(),
        type,
        position,
        data: createNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`Added ${type} node`, {
        style: {
          background: "#1a1a28",
          color: "#f0f0f5",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "13px",
        },
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
      });
    },
    [reactFlowInstance, setNodes],
  );

  // Workspace operations
  const handleSave = useCallback(async () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    try {
      await saveWorkspace(WORKSPACE_ID, flow.nodes, flow.edges, {
        name: workspaceName,
      });
      toast.success("Workspace saved!", {
        style: {
          background: "#1a1a28",
          color: "#f0f0f5",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "13px",
        },
        iconTheme: { primary: "#10b981", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
    }
  }, [reactFlowInstance, workspaceName]);

  const handleLoad = useCallback(async () => {
    try {
      const data = await loadWorkspace(WORKSPACE_ID);
      if (!data) {
        toast("No saved workspace found", {
          icon: "📂",
          style: {
            background: "#1a1a28",
            color: "#f0f0f5",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "13px",
          },
        });
        return;
      }
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      if (data.metadata?.name) setWorkspaceName(data.metadata.name);
      toast.success("Workspace loaded!", {
        style: {
          background: "#1a1a28",
          color: "#f0f0f5",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "13px",
        },
        iconTheme: { primary: "#10b981", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Load failed: ${err.message}`);
    }
  }, [setNodes, setEdges]);

  const handleClear = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    toast("Canvas cleared", {
      icon: "🗑️",
      style: {
        background: "#1a1a28",
        color: "#f0f0f5",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: "13px",
      },
    });
  }, [setNodes, setEdges]);

  const isEmpty =
    nodes.length <= 1 && edges.length === 0 && !nodes[0]?.data?.text;

  return (
    <div className="app-container">
      <Sidebar onSave={handleSave} onLoad={handleLoad} onClear={handleClear} />
      <div className="main-area">
        <TopBar
          workspaceName={workspaceName}
          onNameChange={setWorkspaceName}
          nodeCount={nodes.length}
          edgeCount={edges.length}
        />
        <div className="canvas-wrapper" ref={reactFlowWrapper}>
          {isEmpty && (
            <div className="canvas-empty-state">
              <Workflow size={64} className="canvas-empty-icon" />
              <div className="canvas-empty-title">Start your content flow</div>
              <div className="canvas-empty-desc">
                Drag nodes from the sidebar and connect them to create your
                AI-powered content workflow
              </div>
            </div>
          )}
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#252540" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                switch (n.type) {
                  case "seed":
                    return "#8b5cf6";
                  case "twitter":
                    return "#1da1f2";
                  case "linkedin":
                    return "#0a66c2";
                  case "instagram":
                    return "#e1306c";
                  case "blog":
                    return "#10b981";
                  case "image":
                    return "#f59e0b";
                  case "viralScore":
                    return "#f43f5e";
                  default:
                    return "#606080";
                }
              }}
              maskColor="rgba(10, 10, 15, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
