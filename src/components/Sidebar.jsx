import {
  FileText,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Image,
  TrendingUp,
  GripVertical,
} from "lucide-react";

const NODE_TYPES = [
  {
    type: "seed",
    label: "Seed Content",
    desc: "Input text or URL",
    icon: FileText,
    color: "var(--accent-violet)",
    bgColor: "var(--accent-violet-dim)",
    category: "input",
  },
  {
    type: "twitter",
    label: "Twitter / X",
    desc: "Thread generator",
    icon: Twitter,
    color: "#1da1f2",
    bgColor: "rgba(29, 161, 242, 0.15)",
    category: "output",
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    desc: "Professional post",
    icon: Linkedin,
    color: "#0a66c2",
    bgColor: "rgba(10, 102, 194, 0.15)",
    category: "output",
  },
  {
    type: "instagram",
    label: "Instagram",
    desc: "Caption & hashtags",
    icon: Instagram,
    color: "#e1306c",
    bgColor: "rgba(225, 48, 108, 0.15)",
    category: "output",
  },
  {
    type: "blog",
    label: "Blog Article",
    desc: "Long-form content",
    icon: BookOpen,
    color: "var(--accent-emerald)",
    bgColor: "var(--accent-emerald-dim)",
    category: "output",
  },
  {
    type: "image",
    label: "Image Gen",
    desc: "AI-powered visuals",
    icon: Image,
    color: "var(--accent-amber)",
    bgColor: "var(--accent-amber-dim)",
    category: "tools",
  },
  {
    type: "viralScore",
    label: "Viral Check",
    desc: "Engagement scoring",
    icon: TrendingUp,
    color: "var(--accent-rose)",
    bgColor: "var(--accent-rose-dim)",
    category: "tools",
  },
];

export default function Sidebar({ onSave, onLoad, onClear }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const categories = {
    input: {
      title: "Input",
      nodes: NODE_TYPES.filter((n) => n.category === "input"),
    },
    output: {
      title: "Platform Outputs",
      nodes: NODE_TYPES.filter((n) => n.category === "output"),
    },
    tools: {
      title: "AI Tools",
      nodes: NODE_TYPES.filter((n) => n.category === "tools"),
    },
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">N</div>
          <span className="sidebar-logo-text">NexusFlow</span>
          <span className="sidebar-logo-badge">BETA</span>
        </div>
      </div>

      {Object.entries(categories).map(([key, cat]) => (
        <div className="sidebar-section" key={key}>
          <div className="sidebar-section-title">{cat.title}</div>
          {cat.nodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="sidebar-node-card"
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
              >
                <div
                  className="sidebar-node-icon"
                  style={{ background: node.bgColor, color: node.color }}
                >
                  <Icon />
                </div>
                <div className="sidebar-node-info">
                  <div className="sidebar-node-name">{node.label}</div>
                  <div className="sidebar-node-desc">{node.desc}</div>
                </div>
                <GripVertical
                  size={14}
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                />
              </div>
            );
          })}
        </div>
      ))}

      <div className="sidebar-workspace">
        <button className="sidebar-btn sidebar-btn-primary" onClick={onSave}>
          💾 Save Workspace
        </button>
        <button className="sidebar-btn" onClick={onLoad}>
          📂 Load Workspace
        </button>
        <button className="sidebar-btn" onClick={onClear}>
          🗑️ Clear Canvas
        </button>
      </div>
    </aside>
  );
}
