// ── NexusFlow Shared Constants & Toast Helpers ──

import toast from "react-hot-toast";

// ── Toast Configuration ──
export const TOAST_STYLE = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

const ICON_THEMES = {
  violet: { primary: "#8b5cf6", secondary: "#f0f0f5" },
  emerald: { primary: "#10b981", secondary: "#f0f0f5" },
  rose: { primary: "#f43f5e", secondary: "#f0f0f5" },
  amber: { primary: "#f59e0b", secondary: "#f0f0f5" },
  cyan: { primary: "#06b6d4", secondary: "#f0f0f5" },
  indigo: { primary: "#6366f1", secondary: "#f0f0f5" },
};

/**
 * Show a styled success toast.
 * @param {string} message
 * @param {{ accent?: keyof ICON_THEMES, duration?: number }} opts
 */
export function showSuccess(
  message,
  { accent = "violet", duration = 3000 } = {},
) {
  toast.success(message, {
    style: TOAST_STYLE,
    iconTheme: ICON_THEMES[accent] || ICON_THEMES.violet,
    duration,
  });
}

/**
 * Show a styled error toast.
 * @param {string} message
 */
export function showError(message) {
  toast.error(message, { style: TOAST_STYLE });
}

/**
 * Show a styled info toast (no icon variant).
 * @param {string} message
 * @param {string} [icon]
 */
export function showInfo(message, icon = "ℹ️") {
  toast(message, { icon, style: TOAST_STYLE });
}

// ── Platform Types ──
export const PLATFORM_TYPES = [
  "twitter",
  "linkedin",
  "instagram",
  "blog",
  "youtube",
];

// ── Workspace ──
export const WORKSPACE_ID = "default";
