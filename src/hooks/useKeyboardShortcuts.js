// ── useKeyboardShortcuts — Centralized keyboard handler ──

import { useCallback, useEffect } from "react";

/**
 * Hook for handling keyboard shortcuts.
 * @param {object} handlers - Map of handler functions
 * @param {Function} handlers.onGenerateAll
 * @param {Function} handlers.onExportAll
 * @param {Function} handlers.onSave
 * @param {Function} handlers.onUndo
 * @param {Function} handlers.onRedo
 * @param {Function} handlers.onDeleteSelected
 * @param {Function} handlers.onToggleShortcuts
 */
export default function useKeyboardShortcuts(handlers) {
  const onKeyDown = useCallback(
    (event) => {
      const tag = event.target.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const ctrl = event.ctrlKey || event.metaKey;

      // ── Global shortcuts (work even in inputs) ──
      if (ctrl && event.key === "g") {
        event.preventDefault();
        handlers.onGenerateAll?.();
        return;
      }
      if (ctrl && event.key === "e") {
        event.preventDefault();
        handlers.onExportAll?.();
        return;
      }
      if (ctrl && event.key === "s") {
        event.preventDefault();
        handlers.onSave?.();
        return;
      }
      if (ctrl && event.key === "k") {
        event.preventDefault();
        handlers.onToggleCommandMenu?.();
        return;
      }
      if (ctrl && event.shiftKey && event.key === "Z") {
        event.preventDefault();
        handlers.onRedo?.();
        return;
      }
      if (ctrl && event.key === "z") {
        event.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // ── Canvas-only shortcuts (not in inputs) ──
      if (isInput) return;

      if (event.key === "?") {
        handlers.onToggleShortcuts?.();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        handlers.onDeleteSelected?.();
      }
    },
    [handlers],
  );

  return onKeyDown;
}
