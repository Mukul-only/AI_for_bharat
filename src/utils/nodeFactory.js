// ── NexusFlow Node Factory & Edge Defaults ──

import { MarkerType } from "reactflow";

/**
 * Default edge styling for all connections.
 */
export const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#818cf8", strokeWidth: 2.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#818cf8" },
};

/**
 * Create initial data for a given node type.
 * @param {string} type - Node type identifier
 * @returns {object} Initial node data
 */
export function createNodeData(type) {
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
    case "youtube":
      return { ...base, platform: "youtube", tone: 40, length: "long" };
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
    case "persona":
      return {
        ...base,
        persona: {
          name: "",
          ageRange: "25-34",
          painPoints: "",
          tone: "professional",
          description: "",
        },
      };
    case "abTest":
      return { ...base, variants: [], selectedVariant: null };
    default:
      return base;
  }
}

/**
 * Initial canvas state — single seed node.
 */
export const INITIAL_NODES = [
  {
    id: "seed-1",
    type: "seed",
    position: { x: 50, y: 200 },
    data: { text: "", _urlInput: "", _scraping: false },
  },
];
