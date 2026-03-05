// ── RightPanel — Settings + Trending Ideas ── Dark Minimalist Redesign

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useResizable from "../hooks/useResizable";
import {
  RefreshCw,
  Flame,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Zap,
  Filter,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  AlignLeft,
  Globe,
  Sliders,
  Search,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { getTrendingIdeas } from "../api";
import { PLATFORM_TYPES } from "../utils/constants";

/* ─── Design tokens ─── */
const BG = "#0A0A0A";
const SURFACE = "#111111";
const SURFACE2 = "#1C1C1C";
const SURFACE2_HOVER = "#242424";
const BORDER = "#2A2A2A";
const BORDER2 = "#353535";
const T1 = "#F9FAFB";
const T2 = "#9CA3AF";
const T3 = "#6B7280";
const FONT = "'Inter', system-ui, sans-serif";

/* Accent palette — all solid, no transparency */
const TEAL = "#14B8A6";
const TEAL_DIM = "#134E4A";
const VIOLET = "#818CF8";
const VIOLET_DIM = "#1E1B4B";
const AMBER = "#D97706";
const EMERALD = "#10B981";
const ROSE = "#EF4444";

/* Dark green Use button */
const USE_BG = "#14532D";
const USE_BG_HOVER = "#166534";
const USE_TEXT = "#86EFAC";

const RANK_COLORS = [
  "#D97706" /* gold */,
  "#9CA3AF" /* silver */,
  "#92400E" /* bronze */,
  "#374151",
  "#374151",
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
const NICHE_COLORS = {
  tech: "#3b82f6",
  food: "#f59e0b",
  fashion: "#ec4899",
  college: "#8b5cf6",
  fitness: "#10b981",
  travel: "#06b6d4",
  finance: "#f43f5e",
  other: "#818cf8",
};
const PLATFORM_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  blog: BookOpen,
};
const CATEGORIES = ["All", "Viral Hooks", "Thread Ideas", "Blog Starters"];
const NODE_TYPE_LABELS = {
  seed: "Seed Content",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  blog: "Blog Article",
  youtube: "YouTube Script",
  image: "Image Gen",
  viralScore: "Viral Check",
  tags: "Smart Tags",
  schedule: "Scheduler",
  summarize: "Summarizer",
  persona: "Persona",
  abTest: "A/B Test",
};
const PLATFORM_ACCENT = {
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  instagram: "#E1306C",
  blog: "#34d399",
  youtube: "#FF0000",
  image: "#fbbf24",
  seed: "#818cf8",
  persona: "#e879f9",
  viralScore: "#f87171",
  tags: "#22d3ee",
  schedule: "#a78bfa",
  summarize: "#6366f1",
  abTest: "#22d3ee",
};

/* ─── Shared UI primitives ─── */
const SectionLabel = ({ children }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      color: T3,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: T2, fontWeight: 500, marginBottom: 6 }}>
    {children}
  </div>
);

const DarkInput = ({ value, onChange, placeholder, multiline, rows }) => {
  const base = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 9,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.04)",
    color: T1,
    fontSize: 12,
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    resize: multiline ? "vertical" : "none",
  };
  return multiline ? (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows || 4}
      style={{ ...base, lineHeight: 1.6 }}
      onFocus={(e) => (e.target.style.borderColor = VIOLET)}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={base}
      onFocus={(e) => (e.target.style.borderColor = VIOLET)}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  );
};

const DarkSelect = ({ value, onChange, children, ...rest }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Parse option children into [{value, label}]
  const options = [];
  const extractOptions = (kids) => {
    if (!kids) return;
    (Array.isArray(kids) ? kids : [kids]).forEach((child) => {
      if (!child) return;
      if (child.type === "option") {
        options.push({
          value: child.props.value,
          label:
            typeof child.props.children === "string"
              ? child.props.children
              : String(child.props.children),
        });
      }
    });
  };
  extractOptions(children);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || value || "Select...";

  // Calculate position when opening
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((p) => !p);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll or resize to avoid stale position
  useEffect(() => {
    if (!open) return;
    const handleClose = () => setOpen(false);
    window.addEventListener("resize", handleClose);
    // Find and listen to any scrollable parent
    const scrollParents = [];
    let el = triggerRef.current?.parentElement;
    while (el) {
      if (
        el.scrollHeight > el.clientHeight ||
        el.scrollWidth > el.clientWidth
      ) {
        el.addEventListener("scroll", handleClose);
        scrollParents.push(el);
      }
      el = el.parentElement;
    }
    return () => {
      window.removeEventListener("resize", handleClose);
      scrollParents.forEach((p) =>
        p.removeEventListener("scroll", handleClose),
      );
    };
  }, [open]);

  const dropdownMenu = open ? (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        background: SURFACE2,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
        zIndex: 99999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange({ target: { value: opt.value } });
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "none",
              background: isActive ? "#1A1A1A" : "transparent",
              color: T1,
              fontSize: 12,
              fontFamily: FONT,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "#242424";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive
                ? "#1A1A1A"
                : "transparent";
            }}
          >
            <span>{opt.label}</span>
            {isActive && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: 8,
          border: `1px solid ${BORDER}`,
          background: SURFACE2,
          color: T1,
          fontSize: 12,
          fontFamily: FONT,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          transition: "background 0.12s",
          outline: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
        onMouseLeave={(e) => (e.currentTarget.style.background = SURFACE2)}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {selectedLabel}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            marginLeft: 8,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu — rendered via portal to avoid overflow clipping */}
      {createPortal(dropdownMenu, document.body)}
    </div>
  );
};

const Divider = () => (
  <div style={{ height: 1, background: BORDER, margin: "16px 0" }} />
);

/* ─── Main Component ─── */
function RightPanel({ userProfile, onUseIdea, selectedNode, onNodeUpdate }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const activeTab = selectedNode ? userSelectedTab || "settings" : "trending";

  useEffect(() => {
    setUserSelectedTab(null);
  }, [selectedNode?.id]);

  const niche = userProfile?.niche || "other";
  const nicheLabel = NICHE_LABELS[niche] || "Creator";

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTrendingIdeas(userProfile);
      setIdeas(result.ideas || []);
    } catch (err) {
      if (err.name !== "AbortError")
        console.error("Failed to fetch ideas:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshKey]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);
  const handleUseIdea = (idea) => onUseIdea(idea.seed);

  const filteredIdeas =
    activeCategory === "All"
      ? ideas
      : ideas.filter((idea) => idea.category === activeCategory);

  const isPlatform = selectedNode && PLATFORM_TYPES.includes(selectedNode.type);
  const isImage = selectedNode && selectedNode.type === "image";
  const nodeAccent = selectedNode
    ? PLATFORM_ACCENT[selectedNode.type] || VIOLET
    : VIOLET;

  const {
    width: panelWidth,
    isDragging,
    handleMouseDown,
  } = useResizable({
    defaultWidth: 300,
    minWidth: 220,
    maxWidth: 480,
    side: "right",
  });

  return (
    <div
      style={{
        position: "relative",
        width: collapsed ? 48 : panelWidth,
        minWidth: collapsed ? 48 : panelWidth,
        height: "100vh",
        background: SURFACE,
        borderLeft: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        overflowX: "hidden",
        overflowY: "hidden",
        transition: isDragging
          ? "none"
          : "width 180ms ease, min-width 180ms ease",
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      {/* Resize handle */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
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

      {/* ── Header ── */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
          gap: 8,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", gap: 4 }}>
            {[
              {
                tab: "settings",
                icon: <Settings size={13} />,
                label: "Settings",
              },
              { tab: "trending", icon: <Flame size={13} />, label: "Trending" },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setUserSelectedTab(tab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 99,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: FONT,
                  background: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? "#000" : T2,
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: collapsed ? "auto" : undefined,
          }}
        >
          {!collapsed && activeTab === "trending" && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh ideas"
              style={{
                padding: "5px 10px",
                borderRadius: 99,
                border: `1px solid ${BORDER}`,
                background: "transparent",
                cursor: loading ? "not-allowed" : "pointer",
                color: T2,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = BORDER2;
                e.currentTarget.style.color = T1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = T2;
              }}
            >
              <RefreshCw size={12} className={loading ? "spin-slow" : ""} />
              Refresh
            </button>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            title={collapsed ? "Expand panel" : "Collapse panel"}
            style={{
              padding: 6,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: T2,
              display: "flex",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T1)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T2)}
          >
            {collapsed ? (
              <PanelRightOpen size={15} />
            ) : (
              <PanelRightClose size={15} />
            )}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {/* ─── TRENDING TAB ─── */}
          {activeTab === "trending" && (
            <div style={{ padding: "16px 14px" }}>
              {/* Category pills */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 5,
                      border: "none",
                      background:
                        activeCategory === cat ? "#2A2A2A" : "transparent",
                      color: activeCategory === cat ? T1 : T2,
                      fontSize: 10,
                      fontWeight: activeCategory === cat ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: FONT,
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {cat === "All" && <Sparkles size={10} />}
                    {cat === "Viral Hooks" && <Zap size={10} />}
                    {cat === "Thread Ideas" && <TrendingUp size={10} />}
                    {cat === "Blog Starters" && <BookOpen size={10} />}
                    {cat}
                  </button>
                ))}
              </div>

              {/* Ideas list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: SURFACE2,
                        borderRadius: 11,
                        padding: "14px",
                        border: `1px solid ${BORDER}`,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      <div
                        style={{
                          height: 10,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 6,
                          marginBottom: 10,
                          width: "40%",
                        }}
                      />
                      <div
                        style={{
                          height: 12,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 6,
                          marginBottom: 6,
                          width: "90%",
                        }}
                      />
                      <div
                        style={{
                          height: 10,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 6,
                          width: "60%",
                        }}
                      />
                    </div>
                  ))
                ) : filteredIdeas.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 16px",
                      color: T3,
                    }}
                  >
                    <Filter
                      size={28}
                      style={{ marginBottom: 8, opacity: 0.4 }}
                    />
                    <p style={{ fontSize: 12 }}>No ideas in this category.</p>
                  </div>
                ) : (
                  filteredIdeas.map((idea, idx) => {
                    const rankColor = RANK_COLORS[idx] || T3;
                    const isTop = idx === 0;
                    return (
                      <div
                        key={idea.id}
                        style={{
                          position: "relative",
                          padding: "11px 13px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          background: SURFACE2,
                          borderLeft: `3px solid ${rankColor}`,
                          transition: "background 0.12s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = SURFACE2_HOVER;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = SURFACE2;
                        }}
                      >
                        {/* Top row: rank + category badge */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          {/* Rank */}
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              fontVariantNumeric: "tabular-nums",
                              color: rankColor,
                              letterSpacing: "-0.02em",
                              lineHeight: 1,
                            }}
                          >
                            #{String(idx + 1).padStart(2, "0")}
                          </div>
                          {/* Badges row */}
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              alignItems: "center",
                            }}
                          >
                            {idea.trending && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: "#451A03",
                                  color: "#FCD34D",
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                <Flame size={8} /> TRENDING
                              </div>
                            )}
                            {idea.category && idea.category !== "All" && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  background: "#374151",
                                  color: T2,
                                  fontSize: 9,
                                  fontWeight: 500,
                                }}
                              >
                                {idea.category}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: T1,
                            marginBottom: 7,
                            lineHeight: 1.45,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {idea.title}
                        </div>

                        {/* Tags */}
                        {idea.tags?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              flexWrap: "wrap",
                              marginBottom: 7,
                            }}
                          >
                            {idea.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: 9,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "#1F2937",
                                  color: T2,
                                  fontWeight: 500,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom row: metrics + use button */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          {/* Metrics */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 10,
                            }}
                          >
                            {idea.engagement && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                  color: EMERALD,
                                  fontWeight: 600,
                                }}
                              >
                                <TrendingUp size={9} /> {idea.engagement}% reach
                              </span>
                            )}
                            {idea.platforms?.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 5,
                                  color: T3,
                                }}
                              >
                                {idea.platforms.map((p) => {
                                  const I = PLATFORM_ICONS[p];
                                  return I ? <I key={p} size={10} /> : null;
                                })}
                              </div>
                            )}
                          </div>

                          {/* Use button */}
                          <button
                            onClick={() => handleUseIdea(idea)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: 5,
                              border: "none",
                              background: USE_BG,
                              color: USE_TEXT,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              transition: "background 0.12s",
                              fontFamily: FONT,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = USE_BG_HOVER;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = USE_BG;
                            }}
                          >
                            Use <ArrowRight size={9} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  fontSize: 10,
                  color: T3,
                }}
              >
                <Sparkles size={10} style={{ color: T3 }} />
                <span>AI-curated for your </span>
                <span
                  style={{
                    color: NICHE_COLORS[niche] || EMERALD,
                    fontWeight: 600,
                  }}
                >
                  {nicheLabel}
                </span>
                <span> niche</span>
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === "settings" && (
            <div style={{ padding: "16px 14px" }}>
              {!selectedNode ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 16px",
                    color: T3,
                  }}
                >
                  <Settings
                    size={28}
                    style={{ opacity: 0.3, marginBottom: 10 }}
                  />
                  <p style={{ fontSize: 12, lineHeight: 1.5 }}>
                    Select a node on the canvas to view and configure its
                    settings.
                  </p>
                </div>
              ) : (
                <>
                  {/* Node identity card */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: SURFACE2,
                      borderLeft: `3px solid ${nodeAccent}`,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>
                        {NODE_TYPE_LABELS[selectedNode.type] ||
                          selectedNode.type}
                      </div>
                      <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>
                        #{selectedNode.id.slice(0, 8)}
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: "rgba(52,211,153,0.12)",
                          color: EMERALD,
                          letterSpacing: "0.05em",
                        }}
                      >
                        READY
                      </span>
                    </div>
                  </div>

                  {/* General section */}
                  <SectionLabel>GENERAL</SectionLabel>

                  <div style={{ marginBottom: 12 }}>
                    <FieldLabel>
                      <AlignLeft
                        size={11}
                        style={{ display: "inline", marginRight: 5 }}
                      />
                      Node Label
                    </FieldLabel>
                    <DarkInput
                      value={selectedNode.data.labelOverride || ""}
                      onChange={(e) =>
                        onNodeUpdate(selectedNode.id, {
                          labelOverride: e.target.value,
                        })
                      }
                      placeholder="Custom name for this node..."
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <FieldLabel>
                      <Sliders
                        size={11}
                        style={{ display: "inline", marginRight: 5 }}
                      />
                      Custom AI Instructions
                    </FieldLabel>
                    <DarkInput
                      multiline
                      value={selectedNode.data.customInstructions || ""}
                      onChange={(e) =>
                        onNodeUpdate(selectedNode.id, {
                          customInstructions: e.target.value,
                        })
                      }
                      placeholder={
                        "e.g. 'Write for Gen-Z', 'Never use emojis', 'Mention brand: Acme Corp'"
                      }
                      rows={4}
                    />
                    {/* Apply button for custom instructions */}
                    <button
                      onClick={() =>
                        onNodeUpdate(selectedNode.id, {
                          generateTrigger: Date.now(),
                        })
                      }
                      disabled={!selectedNode.data.customInstructions?.trim()}
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: "7px 12px",
                        borderRadius: 7,
                        border: "none",
                        background: selectedNode.data.customInstructions?.trim()
                          ? "#166534"
                          : SURFACE2,
                        color: selectedNode.data.customInstructions?.trim()
                          ? "#fff"
                          : T3,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: selectedNode.data.customInstructions?.trim()
                          ? "pointer"
                          : "default",
                        fontFamily: FONT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "background 0.15s, color 0.15s",
                        opacity: selectedNode.data.customInstructions?.trim()
                          ? 1
                          : 0.5,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedNode.data.customInstructions?.trim())
                          e.currentTarget.style.background = "#15803d";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedNode.data.customInstructions?.trim())
                          e.currentTarget.style.background = "#166534";
                      }}
                    >
                      <Sparkles size={12} />
                      Apply & Regenerate
                    </button>
                  </div>

                  {/* Platform-specific */}
                  {isPlatform && (
                    <>
                      <Divider />
                      <SectionLabel>PLATFORM & FORMAT</SectionLabel>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <Globe
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Output Language
                        </FieldLabel>
                        <DarkSelect
                          value={selectedNode.data.language || "english"}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              language: e.target.value,
                            })
                          }
                        >
                          <option value="english">English (US)</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="hindi">Hindi</option>
                          <option value="japanese">Japanese</option>
                        </DarkSelect>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <AlignLeft
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Output Format
                        </FieldLabel>
                        <DarkSelect
                          value={selectedNode.data.outputFormat || "auto"}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              outputFormat: e.target.value,
                            })
                          }
                        >
                          <option value="auto">Auto (Platform defaults)</option>
                          <option value="bullet_points">Bullet Points</option>
                          <option value="story">Personal Story</option>
                          <option value="actionable">Actionable Guide</option>
                          <option value="listicle">Listicle</option>
                        </DarkSelect>
                      </div>

                      {/* Apply & Regenerate for platform settings */}
                      <button
                        onClick={() =>
                          onNodeUpdate(selectedNode.id, {
                            generateTrigger: Date.now(),
                          })
                        }
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "8px 12px",
                          borderRadius: 7,
                          border: "none",
                          background: "#166534",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: FONT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#15803d")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#166534")
                        }
                      >
                        <Sparkles size={12} />
                        Apply & Regenerate
                      </button>
                    </>
                  )}

                  {/* Image-specific settings */}
                  {isImage && (
                    <>
                      <Divider />
                      <SectionLabel>IMAGE STYLE</SectionLabel>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <Sparkles
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Art Style
                        </FieldLabel>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 4,
                          }}
                        >
                          {[
                            { value: "photorealistic", label: "📷 Photo" },
                            { value: "illustration", label: "🎨 Illustration" },
                            { value: "minimal", label: "⬜ Minimal" },
                            { value: "abstract", label: "🌀 Abstract" },
                          ].map((s) => (
                            <button
                              key={s.value}
                              onClick={() =>
                                onNodeUpdate(selectedNode.id, {
                                  style: s.value,
                                })
                              }
                              style={{
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: "none",
                                background:
                                  (selectedNode.data.style ||
                                    "photorealistic") === s.value
                                    ? "#2A2A2A"
                                    : "#1C1C1C",
                                color:
                                  (selectedNode.data.style ||
                                    "photorealistic") === s.value
                                    ? T1
                                    : T2,
                                fontSize: 11,
                                fontWeight:
                                  (selectedNode.data.style ||
                                    "photorealistic") === s.value
                                    ? 600
                                    : 400,
                                cursor: "pointer",
                                fontFamily: FONT,
                                transition: "background 0.12s, color 0.12s",
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <Sliders
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Aspect Ratio
                        </FieldLabel>
                        <DarkSelect
                          value={selectedNode.data.aspectRatio || "1:1"}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              aspectRatio: e.target.value,
                            })
                          }
                        >
                          <option value="1:1">1:1 — Square</option>
                          <option value="16:9">16:9 — Landscape</option>
                          <option value="9:16">9:16 — Portrait / Story</option>
                          <option value="4:3">4:3 — Classic</option>
                          <option value="3:2">3:2 — Standard Photo</option>
                        </DarkSelect>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <Globe
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Resolution
                        </FieldLabel>
                        <DarkSelect
                          value={selectedNode.data.resolution || "1024"}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              resolution: e.target.value,
                            })
                          }
                        >
                          <option value="512">512px — Fast</option>
                          <option value="1024">1024px — Standard</option>
                          <option value="1536">1536px — High Quality</option>
                          <option value="2048">2048px — Ultra HD</option>
                        </DarkSelect>
                      </div>

                      <Divider />
                      <SectionLabel>FILTERS & ADJUSTMENTS</SectionLabel>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: 10,
                          border: `1px solid ${BORDER}`,
                          padding: "12px 14px",
                          marginBottom: 8,
                        }}
                      >
                        {[
                          {
                            key: "brightness",
                            label: "Brightness",
                            icon: "☀️",
                            min: 0,
                            max: 200,
                            def: 100,
                            unit: "%",
                          },
                          {
                            key: "contrast",
                            label: "Contrast",
                            icon: "◑",
                            min: 0,
                            max: 200,
                            def: 100,
                            unit: "%",
                          },
                          {
                            key: "saturation",
                            label: "Saturation",
                            icon: "🎨",
                            min: 0,
                            max: 200,
                            def: 100,
                            unit: "%",
                          },
                          {
                            key: "blur",
                            label: "Blur",
                            icon: "💧",
                            min: 0,
                            max: 20,
                            def: 0,
                            unit: "px",
                          },
                        ].map((filter, idx, arr) => {
                          const val =
                            selectedNode.data[`filter_${filter.key}`] ??
                            filter.def;
                          const pct =
                            ((val - filter.min) / (filter.max - filter.min)) *
                            100;
                          const isDefault = val === filter.def;
                          const defPct =
                            ((filter.def - filter.min) /
                              (filter.max - filter.min)) *
                            100;
                          return (
                            <div
                              key={filter.key}
                              style={{
                                marginBottom: idx < arr.length - 1 ? 16 : 0,
                              }}
                            >
                              {/* Label row */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 6,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: T2,
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                >
                                  <span style={{ fontSize: 12 }}>
                                    {filter.icon}
                                  </span>
                                  {filter.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    fontVariantNumeric: "tabular-nums",
                                    color: isDefault ? T3 : "#F59E0B",
                                    background: isDefault
                                      ? "transparent"
                                      : "rgba(245,158,11,0.1)",
                                    padding: isDefault ? "0" : "2px 6px",
                                    borderRadius: 4,
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {val}
                                  {filter.unit}
                                </span>
                              </div>

                              {/* Custom slider track */}
                              <div
                                style={{
                                  position: "relative",
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {/* Background track */}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    borderRadius: 2,
                                    background: "#2A2A2A",
                                  }}
                                />
                                {/* Filled track */}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    width: `${pct}%`,
                                    height: 4,
                                    borderRadius: 2,
                                    background: isDefault
                                      ? "#3A3A3A"
                                      : "linear-gradient(90deg, #D97706, #F59E0B)",
                                    transition:
                                      "width 0.08s ease, background 0.2s",
                                  }}
                                />
                                {/* Default center mark */}
                                {filter.def > filter.min &&
                                  filter.def < filter.max && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        left: `${defPct}%`,
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 2,
                                        height: 10,
                                        borderRadius: 1,
                                        background: isDefault
                                          ? "#444"
                                          : "rgba(255,255,255,0.15)",
                                        transition: "background 0.2s",
                                        zIndex: 1,
                                      }}
                                    />
                                  )}
                                {/* Native range input (transparent, on top) */}
                                <input
                                  type="range"
                                  min={filter.min}
                                  max={filter.max}
                                  value={val}
                                  onChange={(e) =>
                                    onNodeUpdate(selectedNode.id, {
                                      [`filter_${filter.key}`]: Number(
                                        e.target.value,
                                      ),
                                    })
                                  }
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    width: "100%",
                                    height: 20,
                                    margin: 0,
                                    opacity: 0,
                                    cursor: "pointer",
                                    zIndex: 2,
                                  }}
                                />
                                {/* Custom thumb */}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: `${pct}%`,
                                    top: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    background: isDefault ? "#555" : "#F59E0B",
                                    border: "2px solid #1A1A1A",
                                    boxShadow: isDefault
                                      ? "none"
                                      : "0 0 6px rgba(245,158,11,0.4)",
                                    transition: "all 0.08s ease",
                                    pointerEvents: "none",
                                    zIndex: 1,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reset filters button */}
                      <button
                        onClick={() =>
                          onNodeUpdate(selectedNode.id, {
                            filter_brightness: 100,
                            filter_contrast: 100,
                            filter_saturation: 100,
                            filter_blur: 0,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: `1px solid ${BORDER}`,
                          background: "transparent",
                          color: T2,
                          fontSize: 10,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: FONT,
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          transition:
                            "background 0.15s, color 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(245,158,11,0.08)";
                          e.currentTarget.style.borderColor =
                            "rgba(245,158,11,0.25)";
                          e.currentTarget.style.color = "#F59E0B";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = BORDER;
                          e.currentTarget.style.color = T2;
                        }}
                      >
                        ↺ Reset All Filters
                      </button>

                      <Divider />
                      <SectionLabel>OVERLAY & EFFECTS</SectionLabel>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>Color Tint</FieldLabel>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {[
                            {
                              value: "none",
                              label: "None",
                              color: "transparent",
                            },
                            { value: "warm", label: "Warm", color: "#D97706" },
                            { value: "cool", label: "Cool", color: "#3B82F6" },
                            { value: "pink", label: "Pink", color: "#EC4899" },
                            {
                              value: "green",
                              label: "Green",
                              color: "#10B981",
                            },
                            {
                              value: "sepia",
                              label: "Sepia",
                              color: "#92400E",
                            },
                          ].map((tint) => (
                            <button
                              key={tint.value}
                              onClick={() =>
                                onNodeUpdate(selectedNode.id, {
                                  colorTint: tint.value,
                                })
                              }
                              style={{
                                padding: "4px 10px",
                                borderRadius: 5,
                                border:
                                  (selectedNode.data.colorTint || "none") ===
                                  tint.value
                                    ? `1px solid ${tint.color || BORDER2}`
                                    : `1px solid ${BORDER}`,
                                background:
                                  (selectedNode.data.colorTint || "none") ===
                                  tint.value
                                    ? "#2A2A2A"
                                    : SURFACE2,
                                color:
                                  (selectedNode.data.colorTint || "none") ===
                                  tint.value
                                    ? tint.color || T1
                                    : T2,
                                fontSize: 10,
                                fontWeight: 500,
                                cursor: "pointer",
                                fontFamily: FONT,
                                transition: "all 0.12s",
                              }}
                            >
                              {tint.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>Border Radius</FieldLabel>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[
                            { value: "0", label: "Sharp" },
                            { value: "8", label: "Rounded" },
                            { value: "16", label: "Soft" },
                            { value: "9999", label: "Circle" },
                          ].map((r) => (
                            <button
                              key={r.value}
                              onClick={() =>
                                onNodeUpdate(selectedNode.id, {
                                  borderRadius: r.value,
                                })
                              }
                              style={{
                                flex: 1,
                                padding: "5px 4px",
                                borderRadius: 5,
                                border: "none",
                                background:
                                  (selectedNode.data.borderRadius || "0") ===
                                  r.value
                                    ? "#2A2A2A"
                                    : SURFACE2,
                                color:
                                  (selectedNode.data.borderRadius || "0") ===
                                  r.value
                                    ? T1
                                    : T2,
                                fontSize: 10,
                                fontWeight: 500,
                                cursor: "pointer",
                                fontFamily: FONT,
                                transition: "background 0.12s, color 0.12s",
                              }}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Divider />
                      <SectionLabel>CUSTOM PROMPT</SectionLabel>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>
                          <AlignLeft
                            size={11}
                            style={{ display: "inline", marginRight: 5 }}
                          />
                          Prompt Override
                        </FieldLabel>
                        <DarkInput
                          multiline
                          value={selectedNode.data.promptOverride || ""}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              promptOverride: e.target.value,
                            })
                          }
                          placeholder={
                            "Override the AI prompt, e.g. 'A futuristic cityscape, neon lights, cyberpunk style'"
                          }
                          rows={3}
                        />
                        <div
                          style={{
                            fontSize: 9,
                            color: T3,
                            marginTop: 4,
                          }}
                        >
                          Leave empty to auto-generate from connected content
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <FieldLabel>Negative Prompt</FieldLabel>
                        <DarkInput
                          multiline
                          value={selectedNode.data.negativePrompt || ""}
                          onChange={(e) =>
                            onNodeUpdate(selectedNode.id, {
                              negativePrompt: e.target.value,
                            })
                          }
                          placeholder={
                            "Things to avoid, e.g. 'blurry, watermark, text, low quality'"
                          }
                          rows={2}
                        />
                      </div>

                      {/* Generate with Custom Prompt button */}
                      <button
                        onClick={() =>
                          onNodeUpdate(selectedNode.id, {
                            generateTrigger: Date.now(),
                          })
                        }
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "9px 12px",
                          borderRadius: 7,
                          border: "none",
                          background: "#166534",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: FONT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#15803d")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#166534")
                        }
                      >
                        <Sparkles size={13} />
                        Generate with Prompt
                      </button>
                    </>
                  )}

                  {/* Insights section — Neutral */}
                  <Divider />
                  <SectionLabel>INSIGHTS</SectionLabel>

                  {/* Stat cards — context-aware */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 6,
                      marginBottom: 14,
                    }}
                  >
                    {(() => {
                      if (isImage) {
                        const hasImage = !!selectedNode.data.imageUrl;
                        return [
                          {
                            label: "Style",
                            value: (selectedNode.data.style || "photo").slice(
                              0,
                              6,
                            ),
                          },
                          {
                            label: "Res",
                            value: selectedNode.data.resolution || "1024",
                          },
                          {
                            label: "Status",
                            value: hasImage ? "OK" : "—",
                            dot: hasImage,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            style={{
                              padding: "10px 8px",
                              borderRadius: 8,
                              background: SURFACE2,
                              border: `1px solid ${BORDER}`,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                              }}
                            >
                              {stat.dot && (
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#10B981",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: T1,
                                  lineHeight: 1,
                                  textTransform: "capitalize",
                                }}
                              >
                                {stat.value}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 9,
                                color: T3,
                                marginTop: 4,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                fontWeight: 500,
                              }}
                            >
                              {stat.label}
                            </div>
                          </div>
                        ));
                      }
                      const output = selectedNode.data.output || "";
                      const hasOutput = !!output;
                      const wordCount = output.trim()
                        ? output.trim().split(/\s+/).length
                        : 0;
                      const charCount = output.length;
                      return [
                        { label: "Words", value: hasOutput ? wordCount : "—" },
                        { label: "Chars", value: hasOutput ? charCount : "—" },
                        {
                          label: "Status",
                          value: hasOutput ? "OK" : "—",
                          dot: hasOutput,
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            padding: "10px 8px",
                            borderRadius: 8,
                            background: SURFACE2,
                            border: `1px solid ${BORDER}`,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            {stat.dot && (
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#10B981",
                                  display: "inline-block",
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: T1,
                                lineHeight: 1,
                              }}
                            >
                              {stat.value}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: T3,
                              marginTop: 4,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              fontWeight: 500,
                            }}
                          >
                            {stat.label}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Progress bars — text nodes only */}
                  {!isImage &&
                    (() => {
                      const output = selectedNode.data.output || "";
                      const charCount = output.length;
                      const wordCount = output.trim()
                        ? output.trim().split(/\s+/).length
                        : 0;
                      const charLimit = 1500;
                      const charPct = Math.min(
                        (charCount / charLimit) * 100,
                        100,
                      );
                      const engagementPct = charCount > 0 ? 65 : 0;
                      const readabilityPct = charCount > 0 ? 72 : 0;
                      const keywordPct =
                        wordCount > 0
                          ? Math.min(
                              ((output.match(/\b\w{5,}\b/g)?.length || 0) /
                                wordCount) *
                                100,
                              100,
                            )
                          : 0;

                      const bars = [
                        {
                          label: "Predicted Engagement",
                          value: charCount > 0 ? `${engagementPct}/100` : "—",
                          pct: engagementPct,
                          fill: "#4B5563",
                        },
                        {
                          label: "Character Limit",
                          value:
                            charCount > 0 ? `${charCount}/${charLimit}` : "—",
                          pct: charPct,
                          fill: "#374151",
                        },
                        {
                          label: "Readability Score",
                          value: charCount > 0 ? "Good" : "—",
                          pct: readabilityPct,
                          fill: "#4B5563",
                        },
                        {
                          label: "Keyword Density",
                          value:
                            wordCount > 0 ? `${keywordPct.toFixed(1)}%` : "—",
                          pct: keywordPct,
                          fill: "#374151",
                        },
                      ];

                      return bars.map((bar) => (
                        <div key={bar.label} style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: T2,
                                fontWeight: 500,
                              }}
                            >
                              {bar.label}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: T2,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {bar.value}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 99,
                              background: SURFACE2,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${bar.pct}%`,
                                background: bar.fill,
                                borderRadius: 99,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>
                      ));
                    })()}

                  {/* Image-specific insight bars */}
                  {isImage &&
                    (() => {
                      const brightness =
                        selectedNode.data.filter_brightness ?? 100;
                      const contrast = selectedNode.data.filter_contrast ?? 100;
                      const saturation =
                        selectedNode.data.filter_saturation ?? 100;
                      return [
                        {
                          label: "Brightness",
                          value: `${brightness}%`,
                          pct: (brightness / 200) * 100,
                          fill: "#4B5563",
                        },
                        {
                          label: "Contrast",
                          value: `${contrast}%`,
                          pct: (contrast / 200) * 100,
                          fill: "#374151",
                        },
                        {
                          label: "Saturation",
                          value: `${saturation}%`,
                          pct: (saturation / 200) * 100,
                          fill: "#4B5563",
                        },
                      ].map((bar) => (
                        <div key={bar.label} style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: T2,
                                fontWeight: 500,
                              }}
                            >
                              {bar.label}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: T2,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {bar.value}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 99,
                              background: SURFACE2,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${bar.pct}%`,
                                background: bar.fill,
                                borderRadius: 99,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>
                      ));
                    })()}

                  {/* View Full Report button — text nodes only */}
                  {!isImage && (
                    <div style={{ marginTop: 4, marginBottom: 16 }}>
                      <Divider />
                      <button
                        onClick={() => {
                          const output = selectedNode.data.output || "";
                          if (!output) return;
                          const words = output.trim().split(/\s+/).length;
                          const chars = output.length;
                          const sentences =
                            (output.match(/[.!?]+/g) || []).length || 1;
                          const avgWordsPerSentence = (
                            words / sentences
                          ).toFixed(1);
                          alert(
                            `📊 Full Report\n\n` +
                              `Words: ${words}\n` +
                              `Characters: ${chars}\n` +
                              `Sentences: ${sentences}\n` +
                              `Avg words/sentence: ${avgWordsPerSentence}\n` +
                              `Paragraphs: ${(output.match(/\n\n/g) || []).length + 1}`,
                          );
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          background: SURFACE2,
                          color: T2,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: FONT,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "background 0.12s, color 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#242424";
                          e.currentTarget.style.color = T1;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = SURFACE2;
                          e.currentTarget.style.color = T2;
                        }}
                      >
                        <Search size={12} />
                        View Full Report
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RightPanel;
