// ── CommandMenu — Spotlight-style command palette (Cmd/Ctrl+K) ──

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  FileText,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Image,
  TrendingUp,
  Tags,
  Calendar,
  AlignLeft,
  Zap,
  Download,
  Save,
  Undo2,
  Redo2,
  Trash2,
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Command,
  User,
  GitBranch,
} from "lucide-react";

const NODE_COMMANDS = [
  {
    id: "seed",
    label: "Seed Content",
    desc: "Input text or URL",
    icon: FileText,
    type: "node",
    color: "#8b5cf6",
  },
  {
    id: "twitter",
    label: "Twitter / X",
    desc: "Thread generator",
    icon: Twitter,
    type: "node",
    color: "#1da1f2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    desc: "Professional post",
    icon: Linkedin,
    type: "node",
    color: "#0a66c2",
  },
  {
    id: "instagram",
    label: "Instagram",
    desc: "Caption & hashtags",
    icon: Instagram,
    type: "node",
    color: "#e1306c",
  },
  {
    id: "blog",
    label: "Blog Article",
    desc: "Long-form content",
    icon: BookOpen,
    type: "node",
    color: "#10b981",
  },
  {
    id: "image",
    label: "Image Gen",
    desc: "AI-powered visuals",
    icon: Image,
    type: "node",
    color: "#f59e0b",
  },
  {
    id: "viralScore",
    label: "Viral Check",
    desc: "Engagement scoring",
    icon: TrendingUp,
    type: "node",
    color: "#f43f5e",
  },
  {
    id: "tags",
    label: "Smart Tags",
    desc: "SEO & hashtags",
    icon: Tags,
    type: "node",
    color: "#06b6d4",
  },
  {
    id: "schedule",
    label: "Content Calendar",
    desc: "AI posting schedule",
    icon: Calendar,
    type: "node",
    color: "#a855f7",
  },
  {
    id: "summarize",
    label: "Summarizer",
    desc: "Content summarization",
    icon: AlignLeft,
    type: "node",
    color: "#6366f1",
  },
  {
    id: "persona",
    label: "Persona",
    desc: "Audience profile for personalized content",
    icon: User,
    type: "node",
    color: "#e879f9",
  },
  {
    id: "abTest",
    label: "A/B Variants",
    desc: "Generate content variants for comparison",
    icon: GitBranch,
    type: "node",
    color: "#22d3ee",
  },
];

const ACTION_COMMANDS = [
  {
    id: "generate-all",
    label: "Generate All",
    desc: "Generate content for all connected nodes",
    icon: Zap,
    type: "action",
    color: "#8b5cf6",
  },
  {
    id: "export-all",
    label: "Export All",
    desc: "Export all content as JSON",
    icon: Download,
    type: "action",
    color: "#10b981",
  },
  {
    id: "save",
    label: "Save Workspace",
    desc: "Save current workspace",
    icon: Save,
    type: "action",
    color: "#3b82f6",
  },
  {
    id: "undo",
    label: "Undo",
    desc: "Undo last action",
    icon: Undo2,
    type: "action",
    color: "#9090b0",
  },
  {
    id: "redo",
    label: "Redo",
    desc: "Redo last action",
    icon: Redo2,
    type: "action",
    color: "#9090b0",
  },
  {
    id: "clear",
    label: "Clear Canvas",
    desc: "Remove all nodes and edges",
    icon: Trash2,
    type: "action",
    color: "#f43f5e",
  },
];

const ALL_COMMANDS = [...NODE_COMMANDS, ...ACTION_COMMANDS];

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  // Simple fuzzy: every char of query appears in order in text
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function CommandMenu({ onClose, onSpawnNode, onAction }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? ALL_COMMANDS.filter(
        (cmd) => fuzzyMatch(query, cmd.label) || fuzzyMatch(query, cmd.desc),
      )
    : ALL_COMMANDS;

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex];
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (cmd) => {
      if (cmd.type === "node") {
        onSpawnNode(cmd.id);
      } else {
        onAction(cmd.id);
      }
      onClose();
    },
    [onSpawnNode, onAction, onClose],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        executeCommand(filtered[selectedIndex]);
      }
    },
    [filtered, selectedIndex, executeCommand, onClose],
  );

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div
        className="cmd-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="cmd-input-wrapper">
          <Search size={16} className="cmd-search-icon" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search nodes and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>

        {/* Results list */}
        <div className="cmd-list" ref={listRef}>
          {filtered.length === 0 && (
            <div className="cmd-empty">No results found</div>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const isNode = cmd.type === "node";
            return (
              <div
                key={cmd.id}
                className={`cmd-item ${i === selectedIndex ? "cmd-item-active" : ""}`}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => executeCommand(cmd)}
              >
                <div className="cmd-item-icon" style={{ color: cmd.color }}>
                  <Icon size={16} />
                </div>
                <div className="cmd-item-info">
                  <span className="cmd-item-label">{cmd.label}</span>
                  <span className="cmd-item-desc">{cmd.desc}</span>
                </div>
                <span className="cmd-item-type">
                  {isNode ? "Node" : "Action"}
                </span>
                {i === selectedIndex && (
                  <CornerDownLeft size={12} className="cmd-item-enter" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="cmd-footer">
          <span className="cmd-footer-hint">
            <ArrowUp size={11} />
            <ArrowDown size={11} />
            navigate
          </span>
          <span className="cmd-footer-hint">
            <CornerDownLeft size={11} />
            select
          </span>
          <span className="cmd-footer-hint">
            <Command size={11} />K to toggle
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(CommandMenu);
