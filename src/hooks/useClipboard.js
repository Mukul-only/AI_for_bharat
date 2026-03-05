// ── useClipboard — Copy to clipboard with visual feedback ──

import { useState, useCallback, useRef } from "react";
import { copyToClipboard } from "../utils/helpers";
import { showSuccess } from "../utils/constants";

/**
 * Hook for copy-to-clipboard with temporary "copied" visual state.
 * Replaces duplicated copy logic in PlatformNode, TagsNode, SummarizeNode.
 *
 * @param {{ successMessage?: string, resetMs?: number }} opts
 * @returns {{ copy: (text: string) => void, copied: boolean }}
 */
export default function useClipboard({
  successMessage = "Copied!",
  resetMs = 2000,
} = {}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copy = useCallback(
    async (text) => {
      if (!text) return;
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        showSuccess(successMessage, { accent: "emerald", duration: 1500 });
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
      }
    },
    [successMessage, resetMs],
  );

  return { copy, copied };
}
