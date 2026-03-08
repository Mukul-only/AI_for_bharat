import { useRef, useCallback } from "react";
import { DEFAULT_EDGE_OPTIONS } from "../utils/nodeFactory";

// ── Undo/Redo History ──
const MAX_HISTORY = 30;

function useHistory(initialNodes, initialEdges) {
  const historyRef = useRef([]);
  const indexRef = useRef(-1);
  const isUndoingRef = useRef(false);

  const pushState = useCallback((nodes, edges) => {
    if (isUndoingRef.current) return;

    // Truncate any redo states
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);

    // Push a lean snapshot (strip callbacks to save memory)
    const snapshot = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { ...n.position },
        data: { ...n.data },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        ...DEFAULT_EDGE_OPTIONS,
      })),
    };

    historyRef.current.push(snapshot);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      indexRef.current++;
    }
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return null;
    indexRef.current--;
    isUndoingRef.current = true;
    const state = historyRef.current[indexRef.current];
    setTimeout(() => (isUndoingRef.current = false), 0);
    return state;
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return null;
    indexRef.current++;
    isUndoingRef.current = true;
    const state = historyRef.current[indexRef.current];
    setTimeout(() => (isUndoingRef.current = false), 0);
    return state;
  }, []);

  const canUndo = useCallback(() => indexRef.current > 0, []);
  const canRedo = useCallback(
    () => indexRef.current < historyRef.current.length - 1,
    [],
  );

  return { pushState, undo, redo, canUndo, canRedo };
}

export default useHistory;
