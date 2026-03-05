import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { ContentPreferences } from "./types";

/* ─── Tokens (CSS‑var‑aware) ──── */
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const DIVIDER = "var(--pf-divider, rgba(255,255,255,0.06))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

interface Props {
  preferences: ContentPreferences;
  onChange: (u: Partial<ContentPreferences>) => void;
}

const NICHES = [
  "Technology",
  "Fitness & Health",
  "Education",
  "Finance",
  "Travel",
  "Food & Cooking",
  "Gaming",
  "Beauty & Lifestyle",
  "Business",
  "Entertainment",
  "Science",
  "Sports",
];
const PLATFORMS = [
  "YouTube",
  "Instagram",
  "Twitter / X",
  "TikTok",
  "LinkedIn",
  "Pinterest",
  "Facebook",
  "Twitch",
  "Podcast",
  "Blog / Newsletter",
];
const TONES = [
  "Casual & Friendly",
  "Professional",
  "Educational",
  "Humorous",
  "Inspirational",
  "Technical",
  "Storytelling",
  "Minimalist",
];
const AUDIENCES = [
  "Gen Z (16-24)",
  "Millennials (25-40)",
  "Professionals",
  "Parents",
  "Students",
  "Entrepreneurs",
  "General Public",
  "Niche Enthusiasts",
];

function usePortalDropdown(
  options: { itemHeight?: number; maxItems?: number } = {},
) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const itemH = options.itemHeight || 38;
  const maxItems = options.maxItems || 6;

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(maxItems * itemH + 2, 200);
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setPos({
          top: rect.top - dropdownHeight - 4,
          left: rect.left,
          width: rect.width,
        });
      } else {
        setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
    }
    setOpen((p) => !p);
  };

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

  return { open, setOpen, triggerRef, dropdownRef, pos, handleToggle };
}

function SelectDropdown({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  hint?: string;
}) {
  const { open, setOpen, triggerRef, dropdownRef, pos, handleToggle } =
    usePortalDropdown();

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
        maxHeight: 200,
        overflowY: "auto",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => {
            onChange(opt);
            setOpen(false);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
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
          <span style={{ fontSize: 13, color: TEXT_PRI }}>{opt}</span>
          {value === opt && (
            <Check size={13} style={{ color: "#fff", flexShrink: 0 }} />
          )}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div
      style={{ padding: "16px 22px", borderBottom: `1px solid ${DIVIDER}` }}
      className="cp-row-last"
    >
      <p
        style={{
          fontSize: 11,
          color: TEXT_SEC,
          marginBottom: hint ? 2 : 8,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </p>
      {hint && (
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            marginBottom: 8,
          }}
        >
          {hint}
        </p>
      )}
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
          <span style={{ fontSize: 13, color: value ? TEXT_PRI : TEXT_SEC }}>
            {value || "Select an option"}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: TEXT_SEC,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.15s",
              flexShrink: 0,
            }}
          />
        </button>
        {createPortal(dropdownMenu, document.body)}
      </div>
    </div>
  );
}

function MultiSelectField({
  label,
  selected,
  options,
  onChange,
  hint,
}: {
  label: string;
  selected: string[];
  options: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const { open, setOpen, triggerRef, dropdownRef, pos, handleToggle } =
    usePortalDropdown();
  const toggle = (opt: string) =>
    selected.includes(opt)
      ? onChange(selected.filter((s) => s !== opt))
      : onChange([...selected, opt]);

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
        maxHeight: 200,
        overflowY: "auto",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
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
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: `1px solid ${selected.includes(opt) ? "#fff" : "rgba(255,255,255,0.2)"}`,
              background: selected.includes(opt) ? "#fff" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            {selected.includes(opt) && (
              <Check size={10} style={{ color: "#000" }} />
            )}
          </span>
          <span style={{ fontSize: 13, color: TEXT_PRI }}>{opt}</span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div
      style={{ padding: "16px 22px", borderBottom: `1px solid ${DIVIDER}` }}
      className="cp-row-last"
    >
      <p
        style={{
          fontSize: 11,
          color: TEXT_SEC,
          marginBottom: hint ? 2 : 8,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </p>
      {hint && (
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            marginBottom: 8,
          }}
        >
          {hint}
        </p>
      )}
      {selected.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {selected.map((s) => (
            <span
              key={s}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.1)",
                color: TEXT_PRI,
                fontSize: 11,
              }}
            >
              {s}
              <button
                onClick={() => toggle(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: TEXT_SEC,
                  padding: 0,
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
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
          <span style={{ fontSize: 13, color: TEXT_SEC }}>
            {selected.length === 0
              ? "Select platforms"
              : `${selected.length} selected`}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: TEXT_SEC,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.15s",
              flexShrink: 0,
            }}
          />
        </button>
        {createPortal(dropdownMenu, document.body)}
      </div>
    </div>
  );
}

export function ContentPreferencesSection({ preferences, onChange }: Props) {
  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`.cp-row-last:last-child { border-bottom: none !important; }`}</style>
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
          Content Preferences
        </h2>
        <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 5 }}>
          Define your content strategy so the AI can tailor suggestions to your
          needs.
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
        <SelectDropdown
          label="Content Niche"
          value={preferences.niche}
          options={NICHES}
          onChange={(v) => onChange({ niche: v })}
          hint="The main topic area your content covers"
        />
        <MultiSelectField
          label="Target Platforms"
          selected={preferences.platforms}
          options={PLATFORMS}
          onChange={(v) => onChange({ platforms: v })}
          hint="Select all platforms you create content for"
        />
        <SelectDropdown
          label="Target Audience"
          value={preferences.targetAudience}
          options={AUDIENCES}
          onChange={(v) => onChange({ targetAudience: v })}
          hint="Who your content is primarily aimed at"
        />
        <SelectDropdown
          label="Tone / Style"
          value={preferences.toneStyle}
          options={TONES}
          onChange={(v) => onChange({ toneStyle: v })}
          hint="The communication style of your content"
        />
      </div>
    </div>
  );
}
