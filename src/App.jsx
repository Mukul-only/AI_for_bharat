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
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Toaster, toast } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import OnboardingFlow from "./components/OnboardingFlow";
import SeedNode from "./nodes/SeedNode";
import PlatformNode from "./nodes/PlatformNode";
import ImageNode from "./nodes/ImageNode";
import ViralScoreNode from "./nodes/ViralScoreNode";
import TagsNode from "./nodes/TagsNode";
import ScheduleNode from "./nodes/ScheduleNode";
import SummarizeNode from "./nodes/SummarizeNode";
import { generateContent, saveWorkspace, loadWorkspace } from "./api";
import { Workflow, Trash2, X } from "lucide-react";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

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
  tags: TagsNode,
  schedule: ScheduleNode,
  summarize: SummarizeNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#8b5cf6", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
};

let nodeIdCounter = 0;
function getNextId() {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}

function createNodeData(type) {
  const base = { text: "", output: "" };
  switch (type) {
    case "seed":
      return { ...base, _urlInput: "", _scraping: false };
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
    case "tags":
      return { ...base, tagData: null };
    case "schedule":
      return { ...base, scheduleData: null };
    case "summarize":
      return { ...base, format: "paragraph" };
    default:
      return base;
  }
}

const initialNodes = [
  {
    id: "seed-1",
    type: "seed",
    position: { x: 50, y: 200 },
    data: { text: "", _urlInput: "", _scraping: false },
  },
];

// ── Keyboard Shortcuts Modal ──
function ShortcutsModal({ onClose }) {
  const shortcuts = [
    {
      key: "Ctrl + G",
      desc: "Generate All — run all connected platform nodes",
    },
    { key: "Ctrl + E", desc: "Export All — download all content as JSON" },
    { key: "Ctrl + S", desc: "Save workspace" },
    { key: "Delete", desc: "Delete selected nodes/edges" },
    { key: "Shift + Click", desc: "Multi-select nodes" },
    { key: "?", desc: "Toggle this help panel" },
  ];

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <button className="shortcuts-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((s, i) => (
            <div key={i} className="shortcut-row">
              <kbd className="shortcut-key">{s.key}</kbd>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("My Content Workspace");
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // ── Node data updaters ──
  const handleNodeUpdate = useCallback(
    (nodeId, updates) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      );
    },
    [setNodes],
  );

  const handleOutputChange = useCallback(
    (nodeId, output) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, output } } : n,
        ),
      );
    },
    [setNodes],
  );

  const handleImageChange = useCallback(
    (nodeId, imageUrl) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, imageUrl } } : n,
        ),
      );
    },
    [setNodes],
  );

  // ── Inject callbacks ──
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => {
      const data = { ...n.data };
      if (n.type === "seed") data.onUpdate = handleNodeUpdate;
      if (["twitter", "linkedin", "instagram", "blog"].includes(n.type))
        data.onOutputChange = handleOutputChange;
      if (n.type === "image") data.onImageChange = handleImageChange;
      return { ...n, data };
    });
  }, [nodes, handleNodeUpdate, handleOutputChange, handleImageChange]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selNodes, edges: selEdges }) => {
      setSelectedNodes(selNodes || []);
      setSelectedEdges(selEdges || []);
    },
    [],
  );

  // ── Delete selected ──
  const deleteSelected = useCallback(() => {
    const nodeIds = selectedNodes.map((n) => n.id);
    const edgeIds = selectedEdges.map((e) => e.id);
    if (nodeIds.length === 0 && edgeIds.length === 0) return;
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !edgeIds.includes(e.id) &&
          !nodeIds.includes(e.source) &&
          !nodeIds.includes(e.target),
      ),
    );
    toast.success(`Deleted ${nodeIds.length + edgeIds.length} item(s)`, {
      style: toastStyle,
      iconTheme: { primary: "#f43f5e", secondary: "#f0f0f5" },
    });
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  // ── Generate All ──
  const handleGenerateAll = useCallback(async () => {
    const seedNode = nodes.find((n) => n.type === "seed");
    if (!seedNode || !seedNode.data.text?.trim()) {
      toast.error("Add content to the Seed node first!", { style: toastStyle });
      return;
    }

    const platformTypes = ["twitter", "linkedin", "instagram", "blog"];
    const platformNodes = nodes.filter((n) => platformTypes.includes(n.type));

    // Only generate for nodes connected to a seed
    const connectedPlatforms = platformNodes.filter((pn) =>
      edges.some((e) => e.target === pn.id),
    );

    if (connectedPlatforms.length === 0) {
      toast.error("Connect platform nodes to the Seed first!", {
        style: toastStyle,
      });
      return;
    }

    setIsGeneratingAll(true);
    let count = 0;

    for (const pNode of connectedPlatforms) {
      try {
        const result = await generateContent(
          seedNode.data.text,
          pNode.data.platform,
          pNode.data.tone || 50,
          pNode.data.length || "medium",
        );
        handleOutputChange(pNode.id, result.generatedText);
        count++;
      } catch (err) {
        console.error(`Generation failed for ${pNode.data.platform}:`, err);
      }
    }

    setIsGeneratingAll(false);
    toast.success(
      `Generated content for ${count} platform${count > 1 ? "s" : ""}!`,
      {
        style: toastStyle,
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
        duration: 3000,
      },
    );
  }, [nodes, edges, handleOutputChange]);

  // ── Export All ──
  const handleExportAll = useCallback(() => {
    const exportData = {
      workspace: workspaceName,
      exportedAt: new Date().toISOString(),
      content: [],
    };

    nodes.forEach((n) => {
      if (
        ["twitter", "linkedin", "instagram", "blog"].includes(n.type) &&
        n.data.output
      ) {
        exportData.content.push({
          platform: n.data.platform,
          tone: n.data.tone,
          length: n.data.length,
          content: n.data.output,
          characterCount: n.data.output.length,
        });
      }
      if (n.type === "summarize" && n.data.output) {
        exportData.content.push({
          type: "summary",
          format: n.data.format,
          content: n.data.output,
        });
      }
    });

    if (exportData.content.length === 0) {
      toast.error("Generate some content first before exporting!", {
        style: toastStyle,
      });
      return;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusflow-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${exportData.content.length} pieces of content!`, {
      style: toastStyle,
      iconTheme: { primary: "#10b981", secondary: "#f0f0f5" },
    });
  }, [nodes, workspaceName]);

  // ── Load Template ──
  const handleLoadTemplate = useCallback(
    (template) => {
      const newNodes = [];
      const newEdges = [];
      const spacing = 380;
      let seedId = null;

      template.nodes.forEach((type, i) => {
        const id = `tpl_${type}_${Date.now()}_${i}`;
        const isSeed = type === "seed";

        if (isSeed) {
          seedId = id;
          newNodes.push({
            id,
            type,
            position: { x: 50, y: 300 },
            data: createNodeData(type),
          });
        } else {
          const col = Math.floor((i - 1) / 4);
          const row = (i - 1) % 4;
          newNodes.push({
            id,
            type,
            position: { x: 450 + col * spacing, y: 50 + row * 260 },
            data: createNodeData(type),
          });
          if (seedId) {
            newEdges.push({
              id: `edge_${seedId}_${id}`,
              source: seedId,
              target: id,
              ...defaultEdgeOptions,
            });
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
      toast.success(`Loaded "${template.label}" template!`, {
        style: toastStyle,
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
        duration: 3000,
      });

      setTimeout(() => {
        if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    },
    [setNodes, setEdges, reactFlowInstance],
  );

  // ── Workspace operations ──
  const handleSave = useCallback(async () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    try {
      await saveWorkspace(WORKSPACE_ID, flow.nodes, flow.edges, {
        name: workspaceName,
      });
      toast.success("Workspace saved!", {
        style: toastStyle,
        iconTheme: { primary: "#10b981", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Save failed: ${err.message}`, { style: toastStyle });
    }
  }, [reactFlowInstance, workspaceName]);

  const handleLoad = useCallback(async () => {
    try {
      const data = await loadWorkspace(WORKSPACE_ID);
      if (!data) {
        toast("No saved workspace found", { icon: "📂", style: toastStyle });
        return;
      }
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      if (data.metadata?.name) setWorkspaceName(data.metadata.name);
      toast.success("Workspace loaded!", {
        style: toastStyle,
        iconTheme: { primary: "#10b981", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Load failed: ${err.message}`, { style: toastStyle });
    }
  }, [setNodes, setEdges]);

  const handleClear = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setSelectedNodes([]);
    setSelectedEdges([]);
    toast("Canvas cleared", { icon: "🗑️", style: toastStyle });
  }, [setNodes, setEdges]);

  // ── Drag & Drop ──
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
      setNodes((nds) =>
        nds.concat({
          id: getNextId(),
          type,
          position,
          data: createNodeData(type),
        }),
      );
      toast.success(`Added ${type} node`, {
        style: toastStyle,
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
      });
    },
    [reactFlowInstance, setNodes],
  );

  // ── Keyboard handler ──
  const onKeyDown = useCallback(
    (event) => {
      const tag = event.target.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Global shortcuts (work even in inputs)
      if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        handleGenerateAll();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "e") {
        event.preventDefault();
        handleExportAll();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
        return;
      }

      if (isInput) return;

      if (event.key === "?") {
        setShowShortcuts((prev) => !prev);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    },
    [deleteSelected, handleGenerateAll, handleExportAll, handleSave],
  );

  const isEmpty =
    nodes.length <= 1 && edges.length === 0 && !nodes[0]?.data?.text;
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  return (
    <div className="app-container" onKeyDown={onKeyDown} tabIndex={0}>
      <Sidebar
        onSave={handleSave}
        onLoad={handleLoad}
        onClear={handleClear}
        onLoadTemplate={handleLoadTemplate}
      />
      <div className="main-area">
        <TopBar
          workspaceName={workspaceName}
          onNameChange={setWorkspaceName}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onGenerateAll={handleGenerateAll}
          onExportAll={handleExportAll}
          onShowShortcuts={() => setShowShortcuts(true)}
          isGenerating={isGeneratingAll}
        />
        <div className="canvas-wrapper" ref={reactFlowWrapper}>
          {isEmpty && (
            <div className="canvas-empty-state">
              <Workflow size={64} className="canvas-empty-icon" />
              <div className="canvas-empty-title">Start your content flow</div>
              <div className="canvas-empty-desc">
                Drag nodes from the sidebar, use a Quick Start template, or
                paste content into the Seed node
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
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            deleteKeyCode={null}
            multiSelectionKeyCode="Shift"
            proOptions={{ hideAttribution: true }}
            edgesUpdatable
            edgesFocusable
            nodesFocusable
            elementsSelectable
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
                  case "tags":
                    return "#06b6d4";
                  case "schedule":
                    return "#a855f7";
                  case "summarize":
                    return "#6366f1";
                  default:
                    return "#606080";
                }
              }}
              maskColor="rgba(10, 10, 15, 0.8)"
            />
            {hasSelection && (
              <Panel position="top-center" className="delete-panel">
                <button className="delete-panel-btn" onClick={deleteSelected}>
                  <Trash2 size={14} />
                  Delete Selected ({selectedNodes.length + selectedEdges.length}
                  )
                </button>
                <span className="delete-panel-hint">or press Delete key</span>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>
      <Toaster position="bottom-right" />
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}

export default function App() {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("nexusflow_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleOnboardingComplete = (profile) => {
    localStorage.setItem("nexusflow_profile", JSON.stringify(profile));
    setUserProfile(profile);
  };

  if (!userProfile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
