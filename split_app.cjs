const fs = require("fs");
const content = fs.readFileSync("src/App.jsx", "utf-8");
const lines = content.split("\n");

// 1. Extract useHistory
const useHistoryCode = [
  'import { useRef, useCallback } from "react";',
  'import { DEFAULT_EDGE_OPTIONS } from "../utils/nodeFactory";',
  ...lines.slice(118, 182),
].join("\n");
fs.writeFileSync("src/hooks/useHistory.js", useHistoryCode);

// 2. Extract FlowCanvas
const flowCanvasCode = [
  'import { useState, useCallback, useRef, useMemo, useEffect } from "react";',
  'import ReactFlow, { addEdge, useNodesState, useEdgesState, useViewport, Panel, Background, MiniMap } from "reactflow";',
  'import { Toaster } from "react-hot-toast";',
  "",
  'import Sidebar from "./Sidebar";',
  'import TopBar from "./TopBar";',
  'import ErrorBoundary from "./ErrorBoundary";',
  'import ShortcutsModal from "./ShortcutsModal";',
  'import RightPanel from "./RightPanel";',
  'import CommandMenu from "./CommandMenu";',
  "",
  'import SeedNode from "../nodes/SeedNode";',
  'import PlatformNode from "../nodes/PlatformNode";',
  'import ImageNode from "../nodes/ImageNode";',
  'import ViralScoreNode from "../nodes/ViralScoreNode";',
  'import TagsNode from "../nodes/TagsNode";',
  'import ScheduleNode from "../nodes/ScheduleNode";',
  'import SummarizeNode from "../nodes/SummarizeNode";',
  'import PersonaNode from "../nodes/PersonaNode";',
  'import ABTestNode from "../nodes/ABTestNode";',
  "",
  'import { generateContent, saveWorkspace } from "../api";',
  'import { saveWorkflowData } from "../utils/workflowManager";',
  'import { showSuccess, showError, showInfo, PLATFORM_TYPES, WORKSPACE_ID } from "../utils/constants";',
  'import { getNextNodeId } from "../utils/helpers";',
  'import { createNodeData, DEFAULT_EDGE_OPTIONS, INITIAL_NODES } from "../utils/nodeFactory";',
  'import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";',
  'import useHistory from "../hooks/useHistory";',
  "",
  'import { Workflow, Trash2, Undo2, Redo2, Maximize2, ZoomIn, ZoomOut, Plus, Zap } from "lucide-react";',
  "",
  ...lines.slice(90, 118),
  ...lines.slice(183, 1280),
].join("\n");
fs.writeFileSync("src/components/FlowCanvas.jsx", flowCanvasCode);

// 3. Reconstruct App.jsx
const appCode = [
  "// ── NexusFlow — Main Application ──",
  'import { useState, useCallback, useEffect } from "react";',
  'import { ReactFlowProvider } from "reactflow";',
  'import "reactflow/dist/style.css";',
  "",
  'import OnboardingFlow from "./components/OnboardingFlow";',
  'import HomePage from "./components/HomePage";',
  'import AuthScreen from "./components/AuthScreen";',
  'import ProfileWrapper from "./components/profile/ProfileWrapper";',
  'import CaptionGenerator from "./components/CaptionGenerator";',
  'import FlowCanvas from "./components/FlowCanvas";',
  "",
  'import { getWorkflow, setCurrentUserId, getProfileKey, syncWithCloud, pushToCloud } from "./utils/workflowManager";',
  'import { useAuth } from "./contexts/AuthContext";',
  "",
  ...lines.slice(1281),
].join("\n");
fs.writeFileSync("src/App.jsx", appCode);

console.log("Splitting complete!");
