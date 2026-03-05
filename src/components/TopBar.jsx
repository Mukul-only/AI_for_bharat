import { memo, useState, useRef, useEffect } from "react";
import {
  Zap,
  Download,
  Keyboard,
  Undo2,
  Redo2,
  Cloud,
  CloudOff,
  Save,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

const BORDER = "rgba(255,255,255,0.08)";
const T1 = "#F5F5F5";
const T2 = "rgba(255,255,255,0.45)";
const T3 = "rgba(255,255,255,0.22)";
const FONT = "'Inter', system-ui, sans-serif";

function TopBar({
  workspaceName,
  onNameChange,
  nodeCount,
  edgeCount,
  onGenerateAll,
  onExportAll,
  onShowShortcuts,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isGenerating,
  saveStatus,
  userName,
  onSignOut,
  onGoProfile,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  const initials = (userName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ── Small icon-only button ── */
  const IconBtn = ({ onClick, disabled, title, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "5px 8px",
        borderRadius: 7,
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? T3 : T2,
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontFamily: FONT,
        transition: "color 0.15s, background 0.15s",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = T1;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = disabled ? T3 : T2;
      }}
    >
      {children}
    </button>
  );

  /* ── Save status indicator ── */
  const statusColor =
    saveStatus === "saved"
      ? "#4ade80"
      : saveStatus === "saving"
        ? "#fbbf24"
        : T3;
  const StatusIcon =
    saveStatus === "saved" ? Cloud : saveStatus === "saving" ? Save : CloudOff;

  /* ── Divider ── */
  const Divider = () => (
    <div style={{ width: 1, height: 18, background: BORDER, flexShrink: 0 }} />
  );

  return (
    <div
      className="top-bar"
      style={{
        display: "inline-flex",
        alignSelf: "center",
        alignItems: "center",
        height: 44,
        padding: "0 8px",
        margin: "16px auto 0",
        background: "#111111",
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        gap: 2,
        fontFamily: FONT,
        zIndex: 10,
      }}
    >
      {/* Workflow name */}
      <input
        value={workspaceName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Untitled Workflow"
        style={{
          padding: "4px 8px",
          borderRadius: 7,
          border: "none",
          background: "transparent",
          color: T1,
          fontSize: 13,
          fontWeight: 600,
          outline: "none",
          fontFamily: FONT,
          letterSpacing: "-0.01em",
          minWidth: 100,
          maxWidth: 200,
        }}
        onFocus={(e) => (e.target.style.background = "rgba(255,255,255,0.06)")}
        onBlur={(e) => (e.target.style.background = "transparent")}
      />

      <Divider />

      {/* Undo / Redo */}
      <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 size={14} />
      </IconBtn>
      <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
        <Redo2 size={14} />
      </IconBtn>

      <Divider />

      {/* Generate All */}
      <button
        onClick={onGenerateAll}
        disabled={isGenerating}
        title="Generate content for all nodes (Ctrl+G)"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 99,
          border: "none",
          background: isGenerating ? "rgba(255,255,255,0.07)" : "#fff",
          color: isGenerating ? T2 : "#000",
          fontSize: 12,
          fontWeight: 600,
          cursor: isGenerating ? "not-allowed" : "pointer",
          fontFamily: FONT,
          transition: "opacity 0.15s",
          opacity: isGenerating ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isGenerating) e.currentTarget.style.opacity = "0.88";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = isGenerating ? "0.7" : "1";
        }}
      >
        <Zap size={13} />
        {isGenerating ? "Generating..." : "Generate All"}
      </button>

      {/* Export */}
      <IconBtn onClick={onExportAll} title="Export all content (Ctrl+E)">
        <Download size={14} />
      </IconBtn>

      <Divider />

      {/* Save status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 6px",
          fontSize: 11,
          color: statusColor,
          whiteSpace: "nowrap",
        }}
      >
        <StatusIcon
          size={12}
          className={saveStatus === "saving" ? "spin-slow" : ""}
        />
        <span>
          {saveStatus === "saved"
            ? "Saved"
            : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved"}
        </span>
      </div>

      {/* Node / edge count */}
      <div
        style={{
          fontSize: 11,
          color: T3,
          padding: "0 4px",
          whiteSpace: "nowrap",
        }}
      >
        {nodeCount}n · {edgeCount}e
      </div>

      <Divider />

      {/* Shortcuts */}
      <IconBtn onClick={onShowShortcuts} title="Keyboard shortcuts (?)">
        <Keyboard size={14} />
      </IconBtn>

      {/* User avatar */}
      {userName && (
        <div ref={menuRef} style={{ position: "relative", marginLeft: 2 }}>
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            title={userName}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 6px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: T2,
              fontFamily: FONT,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = T1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T2;
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: T1,
              }}
            >
              {initials}
            </div>
            <ChevronDown size={11} />
          </button>
          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                background: "#1a1a1a",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                overflow: "hidden",
                zIndex: 50,
                minWidth: 160,
                boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  padding: "12px 14px 10px",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: T1,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>
                      {userName}
                    </div>
                    <div style={{ fontSize: 10, color: T3 }}>
                      Content Creator
                    </div>
                  </div>
                </div>
              </div>
              {[
                {
                  icon: <User size={13} />,
                  label: "Profile",
                  action: () => {
                    setShowUserMenu(false);
                    onGoProfile?.();
                  },
                },
                {
                  icon: <LogOut size={13} />,
                  label: "Sign Out",
                  action: () => {
                    setShowUserMenu(false);
                    onSignOut?.();
                  },
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
                    gap: 9,
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
                      ? "rgba(239,68,68,0.07)"
                      : "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(TopBar);
