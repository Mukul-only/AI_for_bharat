import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  useViewport,
  Panel,
  Background,
  MiniMap,
} from "reactflow";
import { Toaster } from "react-hot-toast";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ErrorBoundary from "./ErrorBoundary";
import ShortcutsModal from "./ShortcutsModal";
import RightPanel from "./RightPanel";
import CommandMenu from "./CommandMenu";

import SeedNode from "../nodes/SeedNode";
import PlatformNode from "../nodes/PlatformNode";
import ImageNode from "../nodes/ImageNode";
import ViralScoreNode from "../nodes/ViralScoreNode";
import TagsNode from "../nodes/TagsNode";
import ScheduleNode from "../nodes/ScheduleNode";
import SummarizeNode from "../nodes/SummarizeNode";
import PersonaNode from "../nodes/PersonaNode";
import ABTestNode from "../nodes/ABTestNode";

import { generateContent, saveWorkspace } from "../api";
import { saveWorkflowData } from "../utils/workflowManager";
import {
  showSuccess,
  showError,
  showInfo,
  PLATFORM_TYPES,
  WORKSPACE_ID,
} from "../utils/constants";
import { getNextNodeId } from "../utils/helpers";
import {
  createNodeData,
  DEFAULT_EDGE_OPTIONS,
  INITIAL_NODES,
} from "../utils/nodeFactory";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import useHistory from "../hooks/useHistory";

import {
  Workflow,
  Trash2,
  Undo2,
  Redo2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Zap,
} from "lucide-react";

// ── Node Type Registry ──
// Wrapped with ErrorBoundary for per-node crash isolation
function withErrorBoundary(Component) {
  return function WrappedNode(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

const nodeTypes = {
  seed: withErrorBoundary(SeedNode),
  twitter: withErrorBoundary(PlatformNode),
  linkedin: withErrorBoundary(PlatformNode),
  instagram: withErrorBoundary(PlatformNode),
  blog: withErrorBoundary(PlatformNode),
  youtube: withErrorBoundary(PlatformNode),
  image: withErrorBoundary(ImageNode),
  viralScore: withErrorBoundary(ViralScoreNode),
  tags: withErrorBoundary(TagsNode),
  schedule: withErrorBoundary(ScheduleNode),
  summarize: withErrorBoundary(SummarizeNode),
  persona: withErrorBoundary(PersonaNode),
  abTest: withErrorBoundary(ABTestNode),
};

// ── MiniMap Node Colors ──
function minimapNodeColor(node) {
  const colors = {
    seed: "#8b5cf6",
    twitter: "#1da1f2",
    linkedin: "#0a66c2",
    instagram: "#e1306c",
    blog: "#10b981",
    image: "#f59e0b",
    viralScore: "#f87171",
    tags: "#06b6d4",
    schedule: "#a855f7",
    summarize: "#6366f1",
  };
  return colors[node.type] || "#606080";
}

// ── FlowCanvas ──
function FlowCanvas({
  userProfile,
  onResetProfile,
  workflowId,
  onGoHome,
  initialWorkflowData,
  onSignOut,
  userName,
  onGoProfile,
}) {
  const reactFlowWrapper = useRef(null);
  const initNodes =
    initialWorkflowData?.nodes?.length > 0
      ? initialWorkflowData.nodes
      : INITIAL_NODES;
  const initEdges = initialWorkflowData?.edges || [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const viewport = useViewport(); // ← reactive zoom/pan state
  const [workspaceName, setWorkspaceName] = useState(
    initialWorkflowData?.name || "My Content Workspace",
  );
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'unsaved' | 'saving'
  const [historyTick, setHistoryTick] = useState(0);
  const autoSaveTimerRef = useRef(null);

  const { pushState, undo, redo, canUndo, canRedo } = useHistory(
    initNodes,
    initEdges,
  );

  // ── Load template or seed text from home page ──
  useEffect(() => {
    const template = initialWorkflowData?._template;
    const seedText = initialWorkflowData?._seedText;

    if (template) {
      // Build nodes from template (same logic as handleLoadTemplate)
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
              ...DEFAULT_EDGE_OPTIONS,
            });
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } else if (seedText) {
      // Pre-load seed text into the seed node
      setNodes((nds) => {
        const seedNode = nds.find((n) => n.type === "seed");
        if (seedNode) {
          return nds.map((n) =>
            n.id === seedNode.id
              ? { ...n, data: { ...n.data, text: seedText } }
              : n,
          );
        }
        return nds;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save a history snapshot ──
  const saveSnapshot = useCallback(() => {
    setNodes((nds) => {
      setEdges((eds) => {
        pushState(nds, eds);
        return eds;
      });
      return nds;
    });
  }, [pushState, setNodes, setEdges]);

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

  // ── Use seed idea from gallery ──
  const onUseSeedIdea = useCallback(
    (seedText) => {
      setNodes((nds) => {
        const seedNode = nds.find((n) => n.type === "seed");
        if (seedNode) {
          return nds.map((n) =>
            n.id === seedNode.id
              ? { ...n, data: { ...n.data, text: seedText } }
              : n,
          );
        }
        return nds;
      });
      showSuccess("Idea loaded into Seed node!", { accent: "amber" });
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

  // ── Repurpose All (One-click full pipeline) ──
  const handleRepurpose = useCallback(
    async (seedId, seedText) => {
      if (!seedText?.trim()) {
        showError("Add content to the Seed node first!");
        return;
      }

      // Find the seed node to determine its position
      const seedNode = nodes.find((n) => n.id === seedId);
      if (!seedNode) return;

      const cx = seedNode.position.x;
      const cy = seedNode.position.y;

      const REPURPOSE_TYPES = [
        "twitter",
        "linkedin",
        "instagram",
        "blog",
        "tags",
        "schedule",
      ];

      // Check which platform nodes are ALREADY connected to this seed
      const connectedNodeIds = edges
        .filter((e) => e.source === seedId)
        .map((e) => e.target);
      const connectedNodes = nodes.filter((n) =>
        connectedNodeIds.includes(n.id),
      );
      const existingTypes = connectedNodes.map((n) => n.type);

      // Only create nodes for types that DON'T already exist
      const missingTypes = REPURPOSE_TYPES.filter(
        (t) => !existingTypes.includes(t),
      );

      const radius = 420;
      const angleStart = -Math.PI / 3;
      const angleEnd = Math.PI / 3;
      const newNodes = [];
      const newEdges = [];

      missingTypes.forEach((type, i) => {
        const totalIdx = REPURPOSE_TYPES.indexOf(type);
        const angle =
          angleStart +
          (totalIdx / (REPURPOSE_TYPES.length - 1)) * (angleEnd - angleStart);
        const nx = cx + radius * Math.cos(angle) + 350;
        const ny = cy + radius * Math.sin(angle);
        const id = `rep_${type}_${Date.now()}_${i}`;

        newNodes.push({
          id,
          type,
          position: { x: nx, y: ny },
          data: createNodeData(type),
        });

        newEdges.push({
          id: `edge_${seedId}_${id}`,
          source: seedId,
          sourceHandle: "source",
          target: id,
          targetHandle: "target",
          ...DEFAULT_EDGE_OPTIONS,
        });
      });

      if (newNodes.length > 0) {
        saveSnapshot();
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);
      }

      showSuccess(`⚡ Repurposing across ${REPURPOSE_TYPES.length} platforms!`);

      // Fit view after a tick to show the full graph
      setTimeout(() => {
        if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.15 });
      }, 150);

      // Gather ALL platform nodes (existing + newly created)
      const allPlatformNodes = [
        ...connectedNodes.filter((n) => PLATFORM_TYPES.includes(n.type)),
        ...newNodes.filter((n) => PLATFORM_TYPES.includes(n.type)),
      ];

      // Trigger parallel generation on platform nodes
      setIsGeneratingAll(true);
      const results = await Promise.allSettled(
        allPlatformNodes.map(async (pNode) => {
          const result = await generateContent(
            seedText,
            pNode.data.platform || pNode.type,
            pNode.data.tone || 50,
            pNode.data.length || "medium",
            userProfile,
          );
          handleOutputChange(pNode.id, result.generatedText);
          return pNode.data.platform || pNode.type;
        }),
      );
      setIsGeneratingAll(false);

      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.filter((r) => r.status === "rejected").length;
      if (ok > 0) {
        showSuccess(
          `✨ Repurposed to ${ok} platform${ok > 1 ? "s" : ""}!${fail > 0 ? ` (${fail} failed)` : ""}`,
        );
      }
      if (fail > 0 && ok === 0) {
        showError("Generation failed. Check your connection.");
      }
    },
    [
      nodes,
      edges,
      setNodes,
      setEdges,
      saveSnapshot,
      handleOutputChange,
      reactFlowInstance,
      userProfile,
    ],
  );

  // ── Inject callbacks + profile into node data ──
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => {
      const data = { ...n.data };
      if (n.type === "seed") {
        data.onUpdate = handleNodeUpdate;
        data.onRepurpose = handleRepurpose;
      }
      if (PLATFORM_TYPES.includes(n.type)) {
        data.onOutputChange = handleOutputChange;
        data.userProfile = userProfile; // Thread profile to platform nodes
      }
      if (n.type === "image") data.onImageChange = handleImageChange;
      if (n.type === "persona") data.onUpdate = handleNodeUpdate;
      return { ...n, data };
    });
  }, [
    nodes,
    handleNodeUpdate,
    handleRepurpose,
    handleOutputChange,
    handleImageChange,
    userProfile,
  ]);

  // ── Connections ──
  const onConnect = useCallback(
    (params) => {
      saveSnapshot();
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, saveSnapshot],
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
    saveSnapshot();
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !edgeIds.includes(e.id) &&
          !nodeIds.includes(e.source) &&
          !nodeIds.includes(e.target),
      ),
    );
    showSuccess(`Deleted ${nodeIds.length + edgeIds.length} item(s)`, {
      accent: "rose",
    });
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges, saveSnapshot]);

  // ── Generate All (PARALLEL) ──
  const handleGenerateAll = useCallback(async () => {
    const seedNode = nodes.find((n) => n.type === "seed");
    if (!seedNode || !seedNode.data.text?.trim()) {
      showError("Add content to the Seed node first!");
      return;
    }

    const connectedPlatforms = nodes.filter(
      (n) =>
        PLATFORM_TYPES.includes(n.type) && edges.some((e) => e.target === n.id),
    );

    if (connectedPlatforms.length === 0) {
      showError("Connect platform nodes to the Seed first!");
      return;
    }

    setIsGeneratingAll(true);

    // PARALLEL execution with Promise.allSettled
    const results = await Promise.allSettled(
      connectedPlatforms.map(async (pNode) => {
        const result = await generateContent(
          seedNode.data.text,
          pNode.data.platform,
          pNode.data.tone || 50,
          pNode.data.length || "medium",
          userProfile,
        );
        handleOutputChange(pNode.id, result.generatedText);
        return pNode.data.platform;
      }),
    );

    setIsGeneratingAll(false);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    if (successCount > 0) {
      showSuccess(
        `Generated content for ${successCount} platform${successCount > 1 ? "s" : ""}!${failCount > 0 ? ` (${failCount} failed)` : ""}`,
      );
    }
    if (failCount > 0 && successCount === 0) {
      showError("All generation requests failed. Check your connection.");
    }
  }, [nodes, edges, handleOutputChange]);

  // ── Export All ──
  const handleExportAll = useCallback(() => {
    const exportData = {
      workspace: workspaceName,
      exportedAt: new Date().toISOString(),
      content: [],
    };

    nodes.forEach((n) => {
      if (PLATFORM_TYPES.includes(n.type) && n.data.output) {
        exportData.content.push({
          platform: n.data.platform || n.type,
          tone: n.data.tone,
          length: n.data.length,
          content: n.data.output,
          characterCount: n.data.output.length,
        });
      }
      if (n.type === "summarize" && n.data.output) {
        exportData.content.push({
          platform: "summary",
          format: n.data.format,
          content: n.data.output,
          characterCount: n.data.output.length,
        });
      }
    });

    if (exportData.content.length === 0) {
      showError("Generate some content first before exporting!");
      return;
    }

    // Build human-readable content cards HTML
    const platformIcons = {
      twitter: "🐦",
      linkedin: "💼",
      instagram: "📸",
      blog: "📝",
      youtube: "🎬",
      summary: "📋",
    };
    const contentCards = exportData.content
      .map(
        (item) => `
      <div class="card">
        <div class="card-header">
          <span class="icon">${platformIcons[item.platform] || "📄"}</span>
          <span class="platform">${(item.platform || "content").toUpperCase()}</span>
          <span class="chars">${item.characterCount} chars</span>
        </div>
        <div class="card-body">${item.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</div>
      </div>`,
      )
      .join("\n");

    // Copy all content to clipboard
    const allText = exportData.content
      .map((c) => `[${(c.platform || "").toUpperCase()}]\n${c.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allText).catch(() => {});

    // Open styled export page in new tab
    const newTab = window.open("", "_blank");
    if (newTab) {
      newTab.document.write(`<!DOCTYPE html>
<html><head><title>NexusFlow Export — ${workspaceName}</title>
<style>
  * { box-sizing: border-box; }
  body { background: #0f0f1a; color: #e0e0f0; font-family: 'Segoe UI', system-ui, sans-serif;
         padding: 32px; margin: 0; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 22px; color: #a78bfa; margin: 0 0 4px; }
  .subtitle { font-size: 13px; color: #666; margin-bottom: 20px; }
  .actions { margin-bottom: 24px; display: flex; gap: 10px; flex-wrap: wrap; }
  .btn { padding: 10px 22px; border-radius: 8px; border: none; cursor: pointer;
         font-size: 13px; font-weight: 500; font-family: inherit; display: inline-flex;
         align-items: center; gap: 6px; }
  .btn-primary { background: #8b5cf6; color: white; }
  .btn-primary:hover { background: #7c3aed; }
  .btn-pdf { background: #ef4444; color: white; }
  .btn-pdf:hover { background: #dc2626; }
  .btn-outline { background: transparent; border: 1px solid #333; color: #ccc; }
  .btn-outline:hover { background: #1a1a2e; }
  .card { background: #1a1a2e; border: 1px solid #2a2a40; border-radius: 12px;
          margin-bottom: 16px; overflow: hidden; }
  .card-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px;
                  border-bottom: 1px solid #2a2a40; background: #15152a; }
  .icon { font-size: 18px; }
  .platform { font-weight: 600; font-size: 13px; letter-spacing: 0.5px; color: #a78bfa; }
  .chars { margin-left: auto; font-size: 11px; color: #666; }
  .card-body { padding: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap;
               word-break: break-word; color: #d0d0e0; }
  @media print {
    body { background: white; color: #222; padding: 20px; }
    .actions { display: none !important; }
    .card { border: 1px solid #ddd; break-inside: avoid; }
    .card-header { background: #f5f5f5; border-bottom: 1px solid #ddd; }
    .platform { color: #6d28d9; }
    .card-body { color: #333; }
    h1 { color: #6d28d9; }
    .subtitle { color: #888; }
  }
</style></head><body>
<h1>📦 NexusFlow — ${workspaceName}</h1>
<p class="subtitle">${exportData.content.length} pieces of content · Exported ${new Date().toLocaleString()}</p>
<div class="actions">
  <button class="btn btn-pdf" onclick="window.print()">📄 Save as PDF</button>
  <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('raw').value);this.textContent='✓ Copied!'">📋 Copy All Text</button>
</div>
${contentCards}
<textarea id="raw" style="display:none">${allText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
</body></html>`);
      newTab.document.close();
    }

    showSuccess(
      `Exported ${exportData.content.length} pieces — opened in new tab!`,
      { accent: "emerald" },
    );
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
              ...DEFAULT_EDGE_OPTIONS,
            });
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
      showSuccess(`Loaded "${template.label}" template!`);

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
      showSuccess("Workspace saved!", { accent: "emerald" });
    } catch (err) {
      showError(`Save failed: ${err.message}`);
    }
  }, [reactFlowInstance, workspaceName]);

  const handleClear = useCallback(() => {
    saveSnapshot();
    setNodes(INITIAL_NODES);
    setEdges([]);
    setSelectedNodes([]);
    setSelectedEdges([]);
    showInfo("Canvas cleared", "🗑️");
  }, [setNodes, setEdges, saveSnapshot]);

  // ── Auto-Save to workflow manager (debounced 5s) ──
  useEffect(() => {
    // Mark as unsaved whenever nodes or edges change
    setSaveStatus("unsaved");

    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        if (workflowId) {
          saveWorkflowData(workflowId, nodes, edges, { name: workspaceName });
        }
        // Also keep the legacy autosave for backwards compat
        const state = {
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: {
              ...n.data,
              onUpdate: undefined,
              onOutputChange: undefined,
              onImageChange: undefined,
              userProfile: undefined,
            },
          })),
          edges,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem("nexusflow_autosave", JSON.stringify(state));
        setSaveStatus("saved");
      } catch {
        // localStorage full or unavailable
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [nodes, edges, workflowId, workspaceName]);

  // ── Undo / Redo ──
  const handleUndo = useCallback(() => {
    const state = undo();
    if (!state) return;
    setNodes(state.nodes);
    setEdges(state.edges);
    setHistoryTick((t) => t + 1);
    showInfo("Undone", "↩️");
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (!state) return;
    setNodes(state.nodes);
    setEdges(state.edges);
    setHistoryTick((t) => t + 1);
    showInfo("Redone", "↪️");
  }, [redo, setNodes, setEdges]);

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
      saveSnapshot();
      const newId = getNextNodeId();
      setNodes((nds) =>
        nds.concat({
          id: newId,
          type,
          position,
          data: createNodeData(type),
        }),
      );
    },
    [reactFlowInstance, setNodes, saveSnapshot],
  );

  // ── Keyboard shortcuts ──
  const onKeyDown = useKeyboardShortcuts({
    onGenerateAll: handleGenerateAll,
    onExportAll: handleExportAll,
    onSave: handleSave,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDeleteSelected: deleteSelected,
    onToggleShortcuts: () => setShowShortcuts((prev) => !prev),
    onToggleCommandMenu: () => setShowCommandMenu((prev) => !prev),
  });

  const isEmpty =
    nodes.length <= 1 && edges.length === 0 && !nodes[0]?.data?.text;
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  // ── Spawn node at viewport center (Command Menu) ──
  const handleSpawnNode = useCallback(
    (nodeType) => {
      if (!reactFlowInstance) return;
      const { x, y } = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const newId = getNextNodeId(nodeType);
      const newNode = {
        id: newId,
        type: nodeType,
        position: { x: x - 140, y: y - 60 },
        data: createNodeData(nodeType),
      };
      saveSnapshot();
      setNodes((nds) => [...nds, newNode]);
      showSuccess(`Added ${nodeType} node`);
    },
    [reactFlowInstance, setNodes, saveSnapshot],
  );

  // ── Command Menu action handler ──
  const handleCommandAction = useCallback(
    (actionId) => {
      switch (actionId) {
        case "generate-all":
          handleGenerateAll();
          break;
        case "export-all":
          handleExportAll();
          break;
        case "save":
          handleSave();
          break;
        case "undo":
          handleUndo();
          break;
        case "redo":
          handleRedo();
          break;
        case "clear":
          handleClear();
          break;
      }
    },
    [
      handleGenerateAll,
      handleExportAll,
      handleSave,
      handleUndo,
      handleRedo,
      handleClear,
    ],
  );

  // ── Smart Paste (Ctrl+V on canvas → Seed node) ──
  const handleCanvasPaste = useCallback(
    (e) => {
      // Don't intercept paste in inputs
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!reactFlowInstance) return;

      const text = e.clipboardData?.getData("text/plain")?.trim();
      if (!text) return;

      e.preventDefault();
      const { x, y } = reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const newId = getNextNodeId("seed");
      const isUrl = /^https?:\/\//i.test(text);
      const newNode = {
        id: newId,
        type: "seed",
        position: { x: x - 140, y: y - 60 },
        data: isUrl
          ? { text: "", _urlInput: text, _scraping: false }
          : { text, _urlInput: "", _scraping: false },
      };
      saveSnapshot();
      setNodes((nds) => [...nds, newNode]);
      showSuccess(
        isUrl
          ? "Pasted URL into new Seed node"
          : "Pasted content into new Seed node",
        { accent: "emerald" },
      );
    },
    [reactFlowInstance, setNodes, saveSnapshot],
  );

  // ── Save before going home ──
  const handleGoHome = useCallback(() => {
    if (workflowId) {
      saveWorkflowData(workflowId, nodes, edges, { name: workspaceName });
    }
    if (onGoHome) onGoHome();
  }, [workflowId, nodes, edges, workspaceName, onGoHome]);

  return (
    <div
      className="app-container"
      onKeyDown={onKeyDown}
      onPaste={handleCanvasPaste}
      tabIndex={0}
    >
      <Sidebar
        onSave={handleSave}
        onClear={handleClear}
        onLoadTemplate={handleLoadTemplate}
        onResetProfile={onResetProfile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onGoHome={handleGoHome}
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
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo()}
          canRedo={canRedo()}
          isGenerating={isGeneratingAll}
          saveStatus={saveStatus}
          userName={userName}
          onSignOut={onSignOut}
          onGoProfile={onGoProfile}
        />
        <div
          className="canvas-wrapper"
          ref={reactFlowWrapper}
          style={{ position: "relative" }}
        >
          {/* Delete overlay — rendered OUTSIDE ReactFlow to avoid Panel first-render jump bug */}
          {hasSelection && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={deleteSelected}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 14px",
                  height: 34,
                  borderRadius: 99,
                  border: "1px solid rgba(239,68,68,0.28)",
                  background: "rgba(18,18,18,0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                  cursor: "pointer",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(18,18,18,0.92)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)";
                }}
              >
                <Trash2 size={12} style={{ color: "#f87171", flexShrink: 0 }} />
                <span
                  style={{ fontSize: 11, fontWeight: 600, color: "#f87171" }}
                >
                  Delete
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.22)",
                    margin: "0 2px",
                  }}
                >
                  ·
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  {selectedNodes.length + selectedEdges.length} selected
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.16)",
                    marginLeft: 4,
                  }}
                >
                  ⌫
                </span>
              </button>
            </div>
          )}
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
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            deleteKeyCode={null}
            multiSelectionKeyCode="Shift"
            proOptions={{ hideAttribution: true }}
            edgesUpdatable
            edgesFocusable
            nodesFocusable
            elementsSelectable
            onlyRenderVisibleElements
            snapToGrid
            snapGrid={[20, 20]}
          >
            {/* Canvas background: layered dot + cross grid — Stitch-inspired premium dark */}
            <Background
              id="bg-dots"
              variant="dots"
              color="rgba(255,255,255,0.15)"
              gap={10}
              size={2.5}
            />
            <Background
              id="bg-cross"
              variant="cross"
              color="rgba(255,255,255,0.055)"
              gap={70}
              size={5}
            />
            <MiniMap nodeColor={minimapNodeColor} maskColor="#09090b" />

            {/* Bottom Capsule Toolbar */}
            <Panel position="bottom-center" className="canvas-capsule">
              {/* Undo / Redo */}
              <button
                className="capsule-btn"
                onClick={handleUndo}
                disabled={!canUndo()}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                className="capsule-btn"
                onClick={handleRedo}
                disabled={!canRedo()}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={14} />
              </button>

              <div className="capsule-divider" />

              {/* Zoom Out */}
              <button
                className="capsule-btn"
                onClick={() => reactFlowInstance?.zoomOut()}
                title="Zoom out"
              >
                <ZoomOut size={14} />
              </button>

              {/* Zoom % label */}
              <button
                className="capsule-btn capsule-zoom-label"
                onClick={() => reactFlowInstance?.fitView({ padding: 0.3 })}
                title="Click to fit view"
              >
                {Math.round(viewport.zoom * 100)}%
              </button>

              {/* Zoom In */}
              <button
                className="capsule-btn"
                onClick={() => reactFlowInstance?.zoomIn()}
                title="Zoom in"
              >
                <ZoomIn size={14} />
              </button>

              {/* Fit View */}
              <button
                className="capsule-btn"
                onClick={() => reactFlowInstance?.fitView({ padding: 0.3 })}
                title="Fit view"
              >
                <Maximize2 size={14} />
              </button>

              <div className="capsule-divider" />

              {/* Add Node (Command Menu) */}
              <button
                className="capsule-btn capsule-btn-add"
                onClick={() => setShowCommandMenu(true)}
                title="Add node (Ctrl+K)"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>

              {/* Generate All */}
              <button
                className="capsule-btn capsule-btn-generate"
                onClick={handleGenerateAll}
                disabled={isGeneratingAll}
                title="Generate all (Ctrl+G)"
              >
                <Zap size={14} />
                <span>{isGeneratingAll ? "Generating…" : "Generate"}</span>
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
      <Toaster position="bottom-right" />
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
      <RightPanel
        userProfile={userProfile}
        onUseIdea={onUseSeedIdea}
        selectedNode={
          selectedNodes[0]
            ? nodes.find((n) => n.id === selectedNodes[0].id) || null
            : null
        }
        onNodeUpdate={handleNodeUpdate}
      />
      {showCommandMenu && (
        <CommandMenu
          onClose={() => setShowCommandMenu(false)}
          onSpawnNode={handleSpawnNode}
          onAction={handleCommandAction}
        />
      )}
    </div>
  );
}

export default FlowCanvas;
