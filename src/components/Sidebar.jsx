import { memo, useState } from "react";
import useResizable from "../hooks/useResizable";
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
  Rocket,
  Zap,
  PenTool,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  GitBranch,
  Home,
  Youtube,
  Search,
  Save,
  FolderOpen,
  Trash2,
  Settings,
  Sparkles,
} from "lucide-react";

/* ─── Design tokens (match homepage / profile) ─── */
const BG = "#0A0A0A";
const SURFACE = "#111111";
const BORDER = "rgba(255,255,255,0.07)";
const T1 = "#F5F5F5";
const T2 = "rgba(255,255,255,0.45)";
const T3 = "rgba(255,255,255,0.22)";
const FONT = "'Inter', system-ui, sans-serif";

const NODE_TYPES = [
  {
    type: "seed",
    label: "Seed Content",
    desc: "Input text or URL",
    icon: FileText,
    color: "#818cf8",
    bg: "rgba(129,140,248,0.12)",
    category: "core",
  },
  {
    type: "persona",
    label: "Persona",
    desc: "Audience profile",
    icon: User,
    color: "#e879f9",
    bg: "rgba(232,121,249,0.1)",
    category: "core",
  },
  {
    type: "twitter",
    label: "Twitter / X",
    desc: "Thread generator",
    icon: Twitter,
    color: "#1da1f2",
    bg: "rgba(29,161,242,0.1)",
    category: "platforms",
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    desc: "Professional post",
    icon: Linkedin,
    color: "#0a66c2",
    bg: "rgba(10,102,194,0.1)",
    category: "platforms",
  },
  {
    type: "instagram",
    label: "Instagram",
    desc: "Caption & hashtags",
    icon: Instagram,
    color: "#e1306c",
    bg: "rgba(225,48,108,0.1)",
    category: "platforms",
  },
  {
    type: "blog",
    label: "Blog Article",
    desc: "Long-form content",
    icon: BookOpen,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    category: "platforms",
  },
  {
    type: "youtube",
    label: "YouTube Script",
    desc: "Video script engine",
    icon: Youtube,
    color: "#ff4444",
    bg: "rgba(255,68,68,0.1)",
    category: "platforms",
  },
  {
    type: "image",
    label: "Image Gen",
    desc: "AI-powered visuals",
    icon: Image,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    category: "tools",
  },
  {
    type: "viralScore",
    label: "Viral Check",
    desc: "Engagement scoring",
    icon: TrendingUp,
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    category: "tools",
  },
  {
    type: "tags",
    label: "Smart Tags",
    desc: "SEO & hashtags",
    icon: Tags,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    category: "tools",
  },
  {
    type: "schedule",
    label: "Content Calendar",
    desc: "AI posting schedule",
    icon: Calendar,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    category: "tools",
  },
  {
    type: "summarize",
    label: "Summarizer",
    desc: "Content summarization",
    icon: AlignLeft,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    category: "tools",
  },
  {
    type: "abTest",
    label: "A/B Variants",
    desc: "Content optimization",
    icon: GitBranch,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    category: "tools",
  },
];

const TEMPLATES = [
  {
    id: "full",
    label: "Full Campaign",
    desc: "All platforms + analytics",
    icon: Rocket,
    color: "#a78bfa",
    nodes: [
      "seed",
      "twitter",
      "linkedin",
      "instagram",
      "blog",
      "image",
      "viralScore",
      "tags",
      "schedule",
    ],
  },
  {
    id: "social",
    label: "Social Blitz",
    desc: "Twitter + LinkedIn + Instagram",
    icon: Zap,
    color: "#fbbf24",
    nodes: ["seed", "twitter", "linkedin", "instagram", "tags"],
  },
  {
    id: "blog",
    label: "Blog + SEO",
    desc: "Article + tags + scoring",
    icon: PenTool,
    color: "#34d399",
    nodes: ["seed", "blog", "summarize", "tags", "viralScore"],
  },
];

const CATEGORIES = [
  { key: "core", label: "CORE" },
  { key: "platforms", label: "PLATFORMS" },
  { key: "tools", label: "AI TOOLS" },
];

function Sidebar({
  onSave,
  onClear,
  onLoadTemplate,
  onResetProfile,
  collapsed,
  onToggleCollapse,
  onGoHome,
}) {
  const [search, setSearch] = useState("");

  const onDragStart = (e, nodeType) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const filteredNodes = NODE_TYPES.filter(
    (n) =>
      !search.trim() ||
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.desc.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    width: sidebarWidth,
    isDragging,
    handleMouseDown,
  } = useResizable({
    defaultWidth: 224,
    minWidth: 180,
    maxWidth: 380,
    side: "left",
  });

  const iconBtn = (title, onClick) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        padding: 7,
        borderRadius: 7,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: T2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = T1)}
      onMouseLeave={(e) => (e.currentTarget.style.color = T2)}
    >
      {title === "Collapse" || title === "Expand" ? (
        collapsed ? (
          <PanelLeftOpen size={16} />
        ) : (
          <PanelLeftClose size={16} />
        )
      ) : null}
    </button>
  );

  return (
    <aside
      style={{
        position: "relative",
        width: collapsed ? 56 : sidebarWidth,
        minWidth: collapsed ? 56 : sidebarWidth,
        height: "100vh",
        background: SURFACE,
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        overflowY: "auto",
        overflowX: "hidden",
        transition: isDragging
          ? "none"
          : "width 180ms ease, min-width 180ms ease",
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflow: "hidden",
          }}
        >
          <img
            src="/logo.svg"
            alt="NexusFlow"
            style={{
              width: 26,
              height: 26,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T1,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              NexusFlow
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            padding: 6,
            borderRadius: 7,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: T2,
            display: "flex",
            transition: "color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T1)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T2)}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </div>

      {/* ── Home button ── */}
      {onGoHome && (
        <div style={{ padding: "8px 8px 0" }}>
          <button
            onClick={onGoHome}
            title="Back to Home"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: T2,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 500,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = T1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T2;
            }}
          >
            <Home size={14} style={{ flexShrink: 0 }} />
            {!collapsed && "Home"}
          </button>
        </div>
      )}

      {/* ── Search ── */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", position: "relative" }}>
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 19,
              top: "50%",
              transform: "translateY(-50%)",
              color: T3,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px 7px 30px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: "rgba(255,255,255,0.04)",
              color: T1,
              fontSize: 11,
              fontFamily: FONT,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,0.18)")
            }
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
        </div>
      )}

      {/* ── Quick Start Templates ── */}
      {!collapsed && !search && (
        <div style={{ padding: "4px 10px 0" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: T3,
              letterSpacing: "0.08em",
              padding: "6px 2px 4px",
              textTransform: "uppercase",
            }}
          >
            QUICK START
          </div>
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => onLoadTemplate && onLoadTemplate(tpl)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 1,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: `${tpl.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ color: tpl.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: T1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tpl.label}
                  </div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>
                    {tpl.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Node Palette ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px" }}>
        {CATEGORIES.map((cat) => {
          const nodes = filteredNodes.filter((n) => n.category === cat.key);
          if (nodes.length === 0) return null;
          return (
            <div key={cat.key} style={{ marginTop: 8 }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: T3,
                    letterSpacing: "0.08em",
                    padding: "4px 2px 5px",
                    textTransform: "uppercase",
                  }}
                >
                  {cat.label}
                </div>
              )}
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    title={collapsed ? node.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: collapsed ? "8px 4px" : "7px 8px",
                      borderRadius: 8,
                      cursor: "grab",
                      marginBottom: 1,
                      border: "1px solid transparent",
                      transition: "background 0.12s, border-color 0.12s",
                      userSelect: "none",
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = BORDER;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.cursor = "grabbing";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.cursor = "grab";
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: node.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} style={{ color: node.color }} />
                    </div>
                    {!collapsed && (
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: T1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {node.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: T3,
                            marginTop: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {node.desc}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Workspace Actions ── */}
      {!collapsed && (
        <div
          style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 10px 8px" }}
        >
          {[
            {
              label: "Save Workspace",
              icon: <Save size={13} />,
              action: onSave,
              primary: true,
            },
            {
              label: "Clear Canvas",
              icon: <Trash2 size={13} />,
              action: onClear,
            },
            ...(onResetProfile
              ? [
                  {
                    label: "Edit Profile",
                    icon: <Settings size={13} />,
                    action: onResetProfile,
                  },
                ]
              : []),
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${btn.primary ? "transparent" : BORDER}`,
                background: btn.primary ? "#fff" : "transparent",
                color: btn.primary ? "#000" : T2,
                fontSize: 12,
                fontWeight: btn.primary ? 600 : 400,
                cursor: "pointer",
                fontFamily: FONT,
                marginBottom: 4,
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!btn.primary) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = T1;
                } else {
                  e.currentTarget.style.opacity = "0.85";
                }
              }}
              onMouseLeave={(e) => {
                if (!btn.primary) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = T2;
                } else {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Resize Handle ── */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 4,
            height: "100%",
            cursor: "col-resize",
            zIndex: 20,
            background: isDragging ? "rgba(255,255,255,0.15)" : "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
          }
          onMouseLeave={(e) => {
            if (!isDragging) e.currentTarget.style.background = "transparent";
          }}
        />
      )}
    </aside>
  );
}

export default memo(Sidebar);
