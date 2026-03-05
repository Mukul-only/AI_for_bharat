// ── CreatorOS — Home Page / Dashboard ── Dark Minimalist Theme

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Workflow,
  Rocket,
  Zap,
  PenTool,
  Sparkles,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  Edit3,
  ArrowRight,
  TrendingUp,
  Flame,
  Network,
  LayoutGrid,
  Search,
  X,
  Check,
  LogOut,
  User,
  Camera,
} from "lucide-react";
import {
  getAllWorkflows,
  createWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  renameWorkflow,
  migrateAutoSave,
} from "../utils/workflowManager";
import { getTrendingIdeas } from "../api";

/* ─── Design Tokens ─── */
const BG = "#0A0A0A";
const SURFACE = "#111111";
const BORDER = "rgba(255,255,255,0.07)";
const T1 = "#F5F5F5";
const T2 = "rgba(255,255,255,0.45)";
const T3 = "rgba(255,255,255,0.25)";
const FONT = "'Inter', system-ui, sans-serif";
const DIVIDER = "rgba(255,255,255,0.06)";

/* ─── Templates ─── */
const TEMPLATES = [
  {
    id: "full",
    label: "Full Campaign",
    desc: "All platforms + analytics",
    icon: Rocket,
    accent: "#a78bfa",
    bg: "rgba(139,92,246,0.1)",
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
    accent: "#fbbf24",
    bg: "rgba(245,158,11,0.1)",
    nodes: ["seed", "twitter", "linkedin", "instagram", "tags"],
  },
  {
    id: "blog",
    label: "Blog + SEO",
    desc: "Article + tags + scoring",
    icon: PenTool,
    accent: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    nodes: ["seed", "blog", "summarize", "tags", "viralScore"],
  },
];

const NICHE_LABELS = {
  tech: "Tech",
  food: "Food",
  fashion: "Fashion",
  college: "College Life",
  fitness: "Fitness",
  travel: "Travel",
  finance: "Finance",
  other: "Creator",
};

function timeAgo(ts) {
  if (!ts) return "Just now";
  const d = Date.now() - ts,
    m = Math.floor(d / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ─── Tiny card component ─── */
function Card({ children, style = {}, onClick, dashed = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: SURFACE,
        border: dashed
          ? `1.5px dashed rgba(255,255,255,0.12)`
          : `1px solid ${BORDER}`,
        borderRadius: 12,
        ...style,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onClick)
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
      }}
      onMouseLeave={(e) => {
        if (onClick)
          e.currentTarget.style.borderColor = dashed
            ? "rgba(255,255,255,0.12)"
            : BORDER;
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage({
  userProfile,
  onOpenWorkflow,
  onCreateWorkflow,
  onResetProfile,
  onSignOut,
  userName,
  onGoProfile,
  onGoCaptionGenerator,
}) {
  const [workflows, setWorkflows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(true);

  const nicheLabel = NICHE_LABELS[userProfile?.niche] || "Creator";

  useEffect(() => {
    migrateAutoSave();
    refreshWorkflows();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setIdeasLoading(true);
      try {
        const r = await getTrendingIdeas(userProfile);
        if (!cancelled) setIdeas((r.ideas || []).slice(0, 4));
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setIdeasLoading(false);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [userProfile]);

  const refreshWorkflows = useCallback(
    () => setWorkflows(getAllWorkflows()),
    [],
  );

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) return workflows;
    const q = searchQuery.toLowerCase();
    return workflows.filter((w) => w.name.toLowerCase().includes(q));
  }, [workflows, searchQuery]);

  const handleCreateNew = useCallback(() => {
    const wf = createWorkflow("Untitled Workflow");
    onCreateWorkflow(wf.id);
  }, [onCreateWorkflow]);
  const handleCreateFromTemplate = useCallback(
    (tpl) => {
      const wf = createWorkflow(tpl.label);
      onCreateWorkflow(wf.id, tpl);
    },
    [onCreateWorkflow],
  );
  const handleDelete = useCallback(
    (id) => {
      deleteWorkflow(id);
      refreshWorkflows();
      setMenuOpenId(null);
    },
    [refreshWorkflows],
  );
  const handleDuplicate = useCallback(
    (id) => {
      duplicateWorkflow(id);
      refreshWorkflows();
      setMenuOpenId(null);
    },
    [refreshWorkflows],
  );
  const handleStartRename = useCallback((wf) => {
    setRenamingId(wf.id);
    setRenameValue(wf.name);
    setMenuOpenId(null);
  }, []);
  const handleConfirmRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameWorkflow(renamingId, renameValue.trim());
      refreshWorkflows();
    }
    setRenamingId(null);
    setRenameValue("");
  }, [renamingId, renameValue, refreshWorkflows]);
  const handleCancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  useEffect(() => {
    const handler = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [menuOpenId]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12
      ? "Good morning,"
      : h < 17
        ? "Good afternoon,"
        : "Good evening,";
  }, []);

  const totalNodes = workflows.reduce((s, w) => s + (w.nodeCount || 0), 0);
  const totalEdges = workflows.reduce((s, w) => s + (w.edgeCount || 0), 0);

  return (
    <div
      style={{
        height: "100%",
        overflowY: "scroll",
        background: BG,
        fontFamily: FONT,
        color: T1,
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: 56,
          borderBottom: `1px solid ${BORDER}`,
          background: BG,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left — NexusFlow logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <img
              src="/logo.svg"
              alt="NexusFlow"
              style={{
                width: 30,
                height: 30,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T1,
                letterSpacing: "-0.02em",
              }}
            >
              NexusFlow
            </span>
          </div>
          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.07)",
                color: T2,
                fontWeight: 500,
              }}
            >
              {nicheLabel}
            </span>
            <span style={{ fontSize: 13, color: T2 }}>{userName}</span>
            {[
              {
                icon: <User size={15} strokeWidth={1.5} />,
                action: onGoProfile,
                title: "Profile & Settings",
              },
              {
                icon: <LogOut size={15} strokeWidth={1.5} />,
                action: onSignOut,
                title: "Sign out",
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                title={btn.title}
                style={{
                  padding: 7,
                  borderRadius: 8,
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
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 28px 60px",
          boxSizing: "border-box",
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 13,
                color: T2,
                margin: "0 0 4px",
                letterSpacing: "-0.01em",
              }}
            >
              {greeting}
            </p>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 6px",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              {userName || nicheLabel}
            </h1>
            <p style={{ fontSize: 13, color: T3, margin: 0 }}>
              Transform your ideas into multi-platform content with AI
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            id="create-new-workflow"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 99,
              border: "none",
              background: "#fff",
              color: "#000",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              transition: "opacity 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Workflow
          </button>
        </section>

        {/* ── Stats Row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 36,
          }}
        >
          {[
            {
              icon: <Network size={15} style={{ color: "#a78bfa" }} />,
              value: workflows.length,
              label: "Workflows",
            },
            {
              icon: <LayoutGrid size={15} style={{ color: "#60a5fa" }} />,
              value: totalNodes,
              label: "Total Nodes",
            },
            {
              icon: <TrendingUp size={15} style={{ color: "#4ade80" }} />,
              value: totalEdges,
              label: "Connections",
            },
          ].map(({ icon, value, label }) => (
            <div
              key={label}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  padding: 9,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.05)",
                  display: "flex",
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: T2,
                    margin: "2px 0 0",
                    letterSpacing: "0.01em",
                  }}
                >
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Workflows ── */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Workflow size={15} style={{ color: T2 }} />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: T1,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                My Workflows
              </h2>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.07)",
                  color: T2,
                }}
              >
                {workflows.length}
              </span>
            </div>
            {workflows.length > 3 && (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 10,
                    color: T3,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search workflows…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "7px 30px 7px 30px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: SURFACE,
                    color: T1,
                    fontSize: 12,
                    outline: "none",
                    fontFamily: FONT,
                    width: 180,
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(255,255,255,0.2)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: T3,
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredWorkflows.length === 0 && !searchQuery ? (
            /* Empty state */
            <Card
              dashed
              style={{
                padding: "48px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
              onClick={handleCreateNew}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1.5px dashed rgba(255,255,255,0.15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Workflow size={22} style={{ color: T3 }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: T1,
                    margin: "0 0 4px",
                  }}
                >
                  No workflows yet
                </p>
                <p style={{ fontSize: 12, color: T2, margin: 0 }}>
                  Create your first workflow or start from a template below
                </p>
              </div>
              <button
                onClick={handleCreateNew}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 99,
                  border: "none",
                  background: "#fff",
                  color: "#000",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                <Plus size={13} /> Create First Workflow
              </button>
            </Card>
          ) : filteredWorkflows.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                color: T2,
              }}
            >
              <Search size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>
                No workflows matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 8,
              }}
            >
              {/* New card */}
              <Card
                dashed
                style={{
                  padding: "28px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  minHeight: 130,
                }}
                onClick={handleCreateNew}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    border: `1.5px dashed rgba(255,255,255,0.15)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} style={{ color: T3 }} />
                </div>
                <span style={{ fontSize: 13, color: T2, fontWeight: 500 }}>
                  New Workflow
                </span>
              </Card>

              {/* Existing workflow cards */}
              {filteredWorkflows.map((wf) => (
                <Card
                  key={wf.id}
                  style={{
                    padding: "16px 18px",
                    minHeight: 130,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                  onClick={() => {
                    if (renamingId !== wf.id) onOpenWorkflow(wf.id);
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    {renamingId === wf.id ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flex: 1,
                        }}
                      >
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: `1px solid rgba(255,255,255,0.15)`,
                            background: "rgba(255,255,255,0.05)",
                            color: T1,
                            fontSize: 12,
                            outline: "none",
                            fontFamily: FONT,
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmRename();
                          }}
                          style={{
                            padding: 4,
                            borderRadius: 5,
                            border: "none",
                            background: "#fff",
                            color: "#000",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Check size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRename();
                          }}
                          style={{
                            padding: 4,
                            borderRadius: 5,
                            border: "none",
                            background: "rgba(255,255,255,0.07)",
                            color: T1,
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <h3
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: T1,
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {wf.name}
                      </h3>
                    )}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === wf.id ? null : wf.id);
                        }}
                        style={{
                          padding: 4,
                          borderRadius: 5,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: T3,
                          display: "flex",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = T1)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = T3)}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menuOpenId === wf.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            background: "#1a1a1a",
                            border: `1px solid ${BORDER}`,
                            borderRadius: 10,
                            overflow: "hidden",
                            zIndex: 50,
                            minWidth: 140,
                            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                          }}
                        >
                          {[
                            {
                              icon: <Edit3 size={12} />,
                              label: "Rename",
                              action: () => handleStartRename(wf),
                              danger: false,
                            },
                            {
                              icon: <Copy size={12} />,
                              label: "Duplicate",
                              action: () => handleDuplicate(wf.id),
                              danger: false,
                            },
                            {
                              icon: <Trash2 size={12} />,
                              label: "Delete",
                              action: () => handleDelete(wf.id),
                              danger: true,
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "9px 14px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontFamily: FONT,
                                color: item.danger ? "#f87171" : T1,
                                fontSize: 12,
                                textAlign: "left",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = item.danger
                                  ? "rgba(239,68,68,0.08)"
                                  : "rgba(255,255,255,0.05)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              {item.icon}
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {[
                      {
                        icon: <Network size={10} />,
                        val: `${wf.nodeCount || 0} nodes`,
                      },
                      {
                        icon: <TrendingUp size={10} />,
                        val: `${wf.edgeCount || 0} edges`,
                      },
                    ].map((s) => (
                      <span
                        key={s.val}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: T3,
                        }}
                      >
                        {s.icon}
                        {s.val}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: `1px solid ${DIVIDER}`,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: T3,
                      }}
                    >
                      <Clock size={10} />
                      {timeAgo(wf.updatedAt)}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: T2,
                        fontWeight: 500,
                      }}
                    >
                      Open
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Quick Start Templates ── */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Rocket size={15} style={{ color: T2 }} />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: T1,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Quick Start Templates
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleCreateFromTemplate(tpl)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  cursor: "pointer",
                  fontFamily: FONT,
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "#161616";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = SURFACE;
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: tpl.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <tpl.icon size={18} style={{ color: tpl.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T1,
                      margin: "0 0 2px",
                    }}
                  >
                    {tpl.label}
                  </p>
                  <p style={{ fontSize: 11, color: T2, margin: 0 }}>
                    {tpl.desc}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: T3,
                    flexShrink: 0,
                    marginRight: 8,
                  }}
                >
                  {tpl.nodes.length} nodes
                </span>
                <ArrowRight size={14} style={{ color: T3, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>

        {/* ── AI Tools ── */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Sparkles size={15} style={{ color: "#a78bfa" }} />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: T1,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              AI Tools
            </h2>
          </div>
          <button
            onClick={onGoCaptionGenerator}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 22px",
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(96,165,250,0.08))",
              border: "1px solid rgba(167,139,250,0.2)",
              cursor: "pointer",
              fontFamily: FONT,
              textAlign: "left",
              transition: "border-color 0.2s, background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(96,165,250,0.12))";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(96,165,250,0.08))";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(167,139,250,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Camera size={22} style={{ color: "#a78bfa" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T1,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Caption Generator
              </p>
              <p style={{ fontSize: 12, color: T2, marginTop: 3 }}>
                Upload a photo and generate optimized captions for Instagram,
                Twitter, LinkedIn, YouTube & more
              </p>
            </div>
            <ArrowRight size={16} style={{ color: T3, flexShrink: 0 }} />
          </button>
        </section>

        {/* ── Trending Ideas ── */}
        <section style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Flame size={15} style={{ color: "#f59e0b" }} />
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: T1,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Trending Ideas
            </h2>
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 99,
                background: "rgba(245,158,11,0.1)",
                color: "#fbbf24",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              AI-Powered
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 8,
            }}
          >
            {ideasLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[70, 100, 50].map((w) => (
                      <div
                        key={w}
                        style={{
                          height: 10,
                          borderRadius: 99,
                          background: "rgba(255,255,255,0.06)",
                          width: `${w}%`,
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    ))}
                  </div>
                ))
              : ideas.map((idea) => (
                  <div
                    key={idea.id}
                    style={{
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {idea.trending && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: "rgba(245,158,11,0.12)",
                          color: "#fbbf24",
                          letterSpacing: "0.06em",
                          width: "fit-content",
                        }}
                      >
                        <Flame size={9} /> TRENDING
                      </div>
                    )}
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T1,
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {idea.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 11,
                        color: T2,
                        margin: 0,
                        lineHeight: 1.6,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {idea.seed?.slice(0, 100)}...
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", gap: 5 }}>
                        {idea.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: "rgba(255,255,255,0.07)",
                              color: T2,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: T3,
                        }}
                      >
                        <TrendingUp size={11} />
                        {idea.engagement}%
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const wf = createWorkflow(idea.title);
                        onCreateWorkflow(wf.id, null, idea.seed);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "8px 0",
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(255,255,255,0.07)",
                        color: T1,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: FONT,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.12)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.07)")
                      }
                    >
                      Use Idea <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            color: T3,
            fontSize: 12,
          }}
        >
          <Sparkles size={12} />
          <span>Powered by Amazon Bedrock</span>
        </footer>
      </main>
    </div>
  );
}
