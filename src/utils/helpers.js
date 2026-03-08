// ── NexusFlow Shared Helpers ──

/**
 * Creates a debounced version of a function.
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Delay in milliseconds
 * @returns {Function} Debounced function with .cancel() method
 */
export function debounce(fn, ms) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Copy text to clipboard & return success boolean.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("Clipboard API not available");
  } catch {
    // Fallback for older browsers or non-secure contexts
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
}

/**
 * Generate a unique node ID.
 * Uses monotonic counter + timestamp to avoid collisions.
 */
let nodeIdCounter = 0;
export function getNextNodeId() {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}
