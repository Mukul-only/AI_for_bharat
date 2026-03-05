// ── useNodeSource — Find parent node's text content ──

import { useCallback } from "react";
import { useReactFlow } from "reactflow";

/**
 * Hook that finds the text content from a node's parent (source) node.
 * Replaces the duplicated findSeedText/findSourceText pattern across 6 nodes.
 *
 * @param {string} nodeId - The current node's ID
 * @returns {() => string|null} Function that returns the source text or null
 */
export default function useNodeSource(nodeId) {
  const { getEdges, getNode } = useReactFlow();

  return useCallback(() => {
    const edges = getEdges();
    const incomingEdges = edges.filter((e) => e.target === nodeId);

    for (const edge of incomingEdges) {
      const sourceNode = getNode(edge.source);
      if (!sourceNode) continue;
      // Seed nodes store content in 'text', platform nodes in 'output'
      const text = sourceNode.data?.output || sourceNode.data?.text;
      if (text && text.trim()) return text;
    }
    return null;
  }, [nodeId, getEdges, getNode]);
}
