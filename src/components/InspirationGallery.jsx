// ── InspirationGallery — Dynamic trending content ideas ──

import { useState, useEffect, useCallback, memo } from "react";
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
} from "lucide-react";
import { getTrendingIdeas } from "../api";

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
  other: "#9090b0",
};

const PLATFORM_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  blog: BookOpen,
};

const CATEGORIES = ["All", "Viral Hooks", "Thread Ideas", "Blog Starters"];

function InspirationGallery({ userProfile, onUseIdea }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const niche = userProfile?.niche || "other";
  const nicheLabel = NICHE_LABELS[niche] || "Creator";
  const nicheColor = NICHE_COLORS[niche] || "#9090b0";

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTrendingIdeas(userProfile);
      setIdeas(result.ideas || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to fetch ideas:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userProfile, refreshKey]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleUseIdea = (idea) => {
    onUseIdea(idea.seed);
  };

  const filteredIdeas =
    activeCategory === "All"
      ? ideas
      : ideas.filter((idea) => idea.category === activeCategory);

  return (
    <div className={`gallery-panel ${collapsed ? "gallery-collapsed" : ""}`}>
      {/* Header */}
      <div className="gallery-header">
        {!collapsed && (
          <div className="gallery-header-left">
            <Flame size={18} style={{ color: "#f59e0b" }} />
            <h2 className="gallery-title">Trending</h2>
            <span
              className="gallery-niche-badge"
              style={{
                background: `${nicheColor}20`,
                color: nicheColor,
                borderColor: `${nicheColor}40`,
              }}
            >
              {nicheLabel}
            </span>
          </div>
        )}
        {collapsed && <Flame size={18} style={{ color: "#f59e0b" }} />}
        <div className="gallery-header-actions">
          {!collapsed && (
            <button
              className="gallery-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh ideas"
            >
              <RefreshCw size={14} className={loading ? "spin-slow" : ""} />
            </button>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Expand ideas" : "Collapse ideas"}
          >
            {collapsed ? (
              <PanelRightOpen size={16} />
            ) : (
              <PanelRightClose size={16} />
            )}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Filter tabs */}
          <div className="gallery-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gallery-tab ${activeCategory === cat ? "gallery-tab-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" && <Sparkles size={12} />}
                {cat === "Viral Hooks" && <Zap size={12} />}
                {cat === "Thread Ideas" && <TrendingUp size={12} />}
                {cat === "Blog Starters" && <BookOpen size={12} />}
                {cat}
              </button>
            ))}
          </div>

          {/* Ideas list */}
          <div className="gallery-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="gallery-card gallery-card-skeleton">
                  <div className="skeleton-line" style={{ width: "80%" }} />
                  <div className="skeleton-line" style={{ width: "100%" }} />
                  <div className="skeleton-line" style={{ width: "60%" }} />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <div
                      className="skeleton-line"
                      style={{ width: 50, height: 20, borderRadius: 10 }}
                    />
                    <div
                      className="skeleton-line"
                      style={{ width: 60, height: 20, borderRadius: 10 }}
                    />
                  </div>
                </div>
              ))
            ) : filteredIdeas.length === 0 ? (
              <div className="gallery-empty">
                <Filter size={32} style={{ opacity: 0.3 }} />
                <p>No ideas in this category. Try "All" or refresh!</p>
              </div>
            ) : (
              filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className={`gallery-card ${idea.trending ? "gallery-card-trending" : ""}`}
                >
                  {idea.trending && (
                    <div className="gallery-card-trending-badge">
                      <Flame size={10} />
                      TRENDING
                    </div>
                  )}
                  <h3 className="gallery-card-title">{idea.title}</h3>
                  <p className="gallery-card-preview">
                    {idea.seed.slice(0, 120)}...
                  </p>

                  <div className="gallery-card-meta">
                    <div className="gallery-card-tags">
                      {idea.tags.map((tag) => (
                        <span key={tag} className="gallery-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="gallery-card-stats">
                      <div className="gallery-engagement">
                        <TrendingUp size={12} />
                        <span>{idea.engagement}%</span>
                      </div>
                      <div className="gallery-card-platforms">
                        {idea.platforms?.map((p) => {
                          const Icon = PLATFORM_ICONS[p];
                          return Icon ? <Icon key={p} size={12} /> : null;
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    className="gallery-use-btn"
                    onClick={() => handleUseIdea(idea)}
                  >
                    Use this idea
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="gallery-footer">
            <Sparkles size={12} style={{ opacity: 0.5 }} />
            <span>Ideas generated by AI based on your {nicheLabel} niche</span>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(InspirationGallery);
