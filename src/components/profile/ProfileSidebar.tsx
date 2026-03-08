import {
  User,
  Palette,
  Settings,
  BarChart2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { SectionId } from "./types";

/* ─── Design tokens (CSS‑var‑aware) ───────────── */
const BG = "var(--pf-bg, #0A0A0A)";
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

const NAV_ITEMS: {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: "user-info",
    label: "User Info",
    icon: User,
    description: "Profile & avatar",
  },
  {
    id: "content-preferences",
    label: "Content Preferences",
    icon: Palette,
    description: "Niche, platforms, tone",
  },
  {
    id: "app-settings",
    label: "App Settings",
    icon: Settings,
    description: "Theme, AI model, sync",
  },

  {
    id: "account-security",
    label: "Account & Security",
    icon: ShieldCheck,
    description: "Password, data, delete",
  },
];

interface Props {
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
  avatarUrl: string;
  displayName: string;
  email: string;
  onGoBack?: () => void;
}

export function ProfileSidebar({
  activeSection,
  onSelect,
  avatarUrl,
  displayName,
  email,
  onGoBack,
}: Props) {
  return (
    <aside
      style={{
        width: 236,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: FONT,
      }}
    >
      {/* User card */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <img
            src={avatarUrl}
            alt={displayName}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: `1.5px solid ${BORDER}`,
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_PRI,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: TEXT_SEC,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
            >
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: FONT,
                background: active
                  ? "var(--pf-active-bg, #ffffff)"
                  : "transparent",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "rgba(255,255,255,0.055)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                size={15}
                style={{
                  color: active
                    ? "var(--pf-active-text, #000)"
                    : "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: active ? "var(--pf-active-text, #000)" : TEXT_PRI,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: active
                      ? "var(--pf-active-text-sec, rgba(0,0,0,0.5))"
                      : TEXT_SEC,
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/* Mobile tab bar */
export function ProfileTabBar({
  activeSection,
  onSelect,
}: {
  activeSection: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const items = [
    { id: "user-info" as SectionId, icon: User },
    { id: "content-preferences" as SectionId, icon: Palette },
    { id: "app-settings" as SectionId, icon: Settings },
    { id: "usage-stats" as SectionId, icon: BarChart2 },
    { id: "account-security" as SectionId, icon: ShieldCheck },
  ];
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${BORDER}`,
        background: BG,
      }}
    >
      {items.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 0",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: activeSection === id ? "#fff" : TEXT_SEC,
            transition: "color 0.15s",
            fontFamily: FONT,
          }}
        >
          <Icon size={19} />
        </button>
      ))}
    </div>
  );
}
