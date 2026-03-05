// ── ShortcutsModal — Keyboard shortcuts help panel ──

import { memo } from "react";
import { X } from "lucide-react";

const SHORTCUTS = [
  { key: "Ctrl + G", desc: "Generate All — run all connected platform nodes" },
  { key: "Ctrl + E", desc: "Export All — download all content as JSON" },
  { key: "Ctrl + S", desc: "Save workspace" },
  { key: "Ctrl + Z", desc: "Undo last action" },
  { key: "Ctrl + Shift + Z", desc: "Redo last action" },
  { key: "Delete", desc: "Delete selected nodes/edges" },
  { key: "Shift + Click", desc: "Multi-select nodes" },
  { key: "?", desc: "Toggle this help panel" },
];

function ShortcutsModal({ onClose }) {
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
          {SHORTCUTS.map((s, i) => (
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

export default memo(ShortcutsModal);
