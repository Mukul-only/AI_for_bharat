import { Workflow, Sparkles, CalendarDays, RefreshCw } from "lucide-react";
import { UsageStats } from "./types";

/* ─── Tokens (CSS‑var‑aware) ──── */
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const DIVIDER = "var(--pf-divider, rgba(255,255,255,0.06))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

interface Props {
  stats: UsageStats;
  recentActivity?: { action: string; time: string; icon: string }[];
}

const STAT_CARDS = (stats: UsageStats) => [
  {
    icon: Workflow,
    label: "Workflows Created",
    value: stats.workflowsCreated.toLocaleString(),
    description: "Total workflows built",
    iconColor: "#a78bfa",
    iconBg: "rgba(139,92,246,0.1)",
  },
  {
    icon: Sparkles,
    label: "AI Generations",
    value: stats.aiGenerationsUsed.toLocaleString(),
    description: "Content pieces generated",
    iconColor: "#fbbf24",
    iconBg: "rgba(245,158,11,0.1)",
  },
  {
    icon: CalendarDays,
    label: "Account Created",
    value: stats.accountCreated,
    description: "Member since",
    iconColor: "#4ade80",
    iconBg: "rgba(34,197,94,0.1)",
  },
  {
    icon: RefreshCw,
    label: "Last Synced",
    value: stats.lastSynced,
    description: "Most recent cloud sync",
    iconColor: "#60a5fa",
    iconBg: "rgba(59,130,246,0.1)",
  },
];

export function UsageStatsSection({ stats, recentActivity }: Props) {
  const generationLimit = 500;
  const generationPercent = Math.min(
    (stats.aiGenerationsUsed / generationLimit) * 100,
    100,
  );

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Heading */}
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
          Usage Statistics
        </h2>
        <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 5 }}>
          Track your activity and usage across the platform.
        </p>
      </div>

      {/* Stat cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {STAT_CARDS(stats).map(
          ({ icon: Icon, label, value, description, iconColor, iconBg }) => (
            <div
              key={label}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} style={{ color: iconColor }} />
                </div>
              </div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: TEXT_PRI,
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
              <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
                {description}
              </p>
            </div>
          ),
        )}
      </div>

      {/* AI Generation Usage bar */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "20px 22px",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_PRI,
                margin: 0,
              }}
            >
              AI Generation Usage
            </p>
            <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 3 }}>
              This billing period
            </p>
          </div>
          <span style={{ fontSize: 13, color: TEXT_PRI }}>
            {stats.aiGenerationsUsed}{" "}
            <span style={{ color: TEXT_SEC }}>/ {generationLimit}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 3,
            borderRadius: 99,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: generationPercent > 80 ? "#f59e0b" : "#fff",
              width: `${generationPercent}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 9 }}>
          {generationLimit - stats.aiGenerationsUsed} generations remaining
          {generationPercent > 80 && (
            <span style={{ color: "#f59e0b", marginLeft: 6 }}>
              · Running low
            </span>
          )}
        </p>
      </div>

      {/* Recent activity */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: TEXT_PRI,
            marginBottom: 16,
            margin: "0 0 14px",
          }}
        >
          Recent Activity
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(recentActivity && recentActivity.length > 0
            ? recentActivity
            : [
                {
                  action: "Generated YouTube script",
                  time: "2 hours ago",
                  icon: "✍️",
                },
                {
                  action: "Created new workflow",
                  time: "Yesterday",
                  icon: "⚡",
                },
                {
                  action: "Cloud sync completed",
                  time: "Yesterday",
                  icon: "☁️",
                },
                {
                  action: "Updated content preferences",
                  time: "3 days ago",
                  icon: "⚙️",
                },
                {
                  action: "Generated Instagram captions",
                  time: "5 days ago",
                  icon: "📸",
                },
              ]
          ).map((item, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${DIVIDER}` : "none",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: TEXT_PRI,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.action}
                </p>
              </div>
              <span style={{ fontSize: 11, color: TEXT_SEC, flexShrink: 0 }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
