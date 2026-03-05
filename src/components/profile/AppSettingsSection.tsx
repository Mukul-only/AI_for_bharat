import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Moon, ChevronDown, Check, Cloud, CloudOff } from "lucide-react";
import { AppSettings } from "./types";

/* ─── Tokens (CSS‑var‑aware) ──── */
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const DIVIDER = "var(--pf-divider, rgba(255,255,255,0.06))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

interface Props {
  settings: AppSettings;
  onChange: (u: Partial<AppSettings>) => void;
}

const AI_MODELS = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Best for complex reasoning",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Fastest responses",
  },
  {
    id: "titan-text-premier",
    name: "Amazon Titan Text Premier",
    description: "Great for structured content",
  },
  {
    id: "llama-3-70b",
    name: "Meta Llama 3 70B",
    description: "Open-source powerhouse",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    description: "Efficient & multilingual",
  },
];

const SAVE_INTERVALS = [
  { value: 30, label: "Every 30 seconds" },
  { value: 60, label: "Every minute" },
  { value: 120, label: "Every 2 minutes" },
  { value: 300, label: "Every 5 minutes" },
  { value: 0, label: "Manual only" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        height: 22,
        width: 40,
        alignItems: "center",
        borderRadius: 99,
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        background: checked ? "#fff" : "rgba(255,255,255,0.12)",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: checked ? "#000" : "rgba(255,255,255,0.6)",
          transform: checked ? "translateX(21px)" : "translateX(3px)",
          transition: "transform 0.2s, background 0.2s",
        }}
      />
    </button>
  );
}

function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  renderOption,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
  renderOption?: (o: {
    value: T;
    label: string;
    sub?: string;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find((o) => o.value === value);

  // Calculate position when opening
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = options.length * 44 + 2; // approximate height
      // If not enough space below, open upward
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setPos({
          top: rect.top - dropdownHeight - 4,
          left: rect.left,
          width: rect.width,
        });
      } else {
        setPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
    setOpen((p) => !p);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll or resize
  useEffect(() => {
    if (!open) return;
    const handleClose = () => setOpen(false);
    window.addEventListener("resize", handleClose);
    const scrollParents: HTMLElement[] = [];
    let el = triggerRef.current?.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight) {
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
      ref={dropdownRef}
      style={{
        position: "fixed",
        zIndex: 99999,
        top: pos.top,
        left: pos.left,
        width: pos.width,
        background: "#161616",
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: FONT,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div>
            <p style={{ fontSize: 13, color: TEXT_PRI, margin: 0 }}>
              {opt.label}
            </p>
            {opt.sub && (
              <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 1 }}>
                {opt.sub}
              </p>
            )}
          </div>
          {value === opt.value && (
            <Check size={13} style={{ color: "#fff", flexShrink: 0 }} />
          )}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 13px",
          borderRadius: 9,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${BORDER}`,
          color: TEXT_PRI,
          cursor: "pointer",
          fontFamily: FONT,
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: 13, color: TEXT_PRI, margin: 0 }}>
            {selected?.label || "Select"}
          </p>
          {selected?.sub && (
            <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 1 }}>
              {selected.sub}
            </p>
          )}
        </div>
        <ChevronDown
          size={14}
          style={{
            color: TEXT_SEC,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </button>
      {createPortal(dropdownMenu, document.body)}
    </div>
  );
}

function SectionRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ padding: "16px 22px", borderBottom: `1px solid ${DIVIDER}` }}
      className="settings-row-last"
    >
      {children}
    </div>
  );
}

export function AppSettingsSection({ settings, onChange }: Props) {
  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`.settings-row-last:last-child { border-bottom: none !important; }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          App Settings
        </h2>
        <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 5 }}>
          Customize how the app looks and behaves for your workflow.
        </p>
      </div>

      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Theme — Dark only */}
        <SectionRow>
          <p
            style={{
              fontSize: 11,
              color: TEXT_SEC,
              marginBottom: 3,
              letterSpacing: "0.02em",
            }}
          >
            Appearance
          </p>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 12,
            }}
          >
            Dark mode is enabled by default
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <Moon size={17} style={{ color: "#93c5fd" }} />
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Dark Mode
              </p>
              <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
                Active · Default theme
              </p>
            </div>
          </div>
        </SectionRow>

        {/* AI Model */}
        <SectionRow>
          <p
            style={{
              fontSize: 11,
              color: TEXT_SEC,
              marginBottom: 3,
              letterSpacing: "0.02em",
            }}
          >
            Default AI Model
          </p>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 10,
            }}
          >
            Preferred model for content generation
          </p>
          <Dropdown
            value={settings.defaultAIModel}
            options={AI_MODELS.map((m) => ({
              value: m.id,
              label: m.name,
              sub: m.description,
            }))}
            onChange={(v) => onChange({ defaultAIModel: v })}
          />
        </SectionRow>

        {/* Auto-save */}
        <SectionRow>
          <p
            style={{
              fontSize: 11,
              color: TEXT_SEC,
              marginBottom: 3,
              letterSpacing: "0.02em",
            }}
          >
            Auto-save Interval
          </p>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 10,
            }}
          >
            How often your workflows are automatically saved
          </p>
          <Dropdown
            value={settings.autoSaveInterval}
            options={SAVE_INTERVALS.map((i) => ({
              value: i.value,
              label: i.label,
            }))}
            onChange={(v) => onChange({ autoSaveInterval: v })}
          />
        </SectionRow>

        {/* Cloud Sync */}
        <SectionRow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  padding: 9,
                  borderRadius: 9,
                  background: settings.cloudSync
                    ? "rgba(59,130,246,0.12)"
                    : "rgba(255,255,255,0.06)",
                  display: "flex",
                }}
              >
                {settings.cloudSync ? (
                  <Cloud size={14} style={{ color: "#60a5fa" }} />
                ) : (
                  <CloudOff size={14} style={{ color: TEXT_SEC }} />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: TEXT_PRI,
                    margin: 0,
                  }}
                >
                  Cloud Sync
                </p>
                <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
                  {settings.cloudSync
                    ? "Your workflows sync across devices"
                    : "Cloud sync is disabled"}
                </p>
              </div>
            </div>
            <Toggle
              checked={settings.cloudSync}
              onChange={(v) => onChange({ cloudSync: v })}
            />
          </div>
        </SectionRow>
      </div>
    </div>
  );
}
