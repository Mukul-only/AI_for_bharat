import { useState, useCallback, useRef, useEffect } from "react";
import { LogOut, Bell, Settings2, ArrowLeft } from "lucide-react";
import { ProfileSidebar, ProfileTabBar } from "./ProfileSidebar";
import { UserInfoSection } from "./UserInfoSection";
import { ContentPreferencesSection } from "./ContentPreferencesSection";
import { AppSettingsSection } from "./AppSettingsSection";
import { UsageStatsSection } from "./UsageStatsSection";
import { AccountSecuritySection } from "./AccountSecuritySection";

const AVATAR_URL =
  "https://images.unsplash.com/photo-1758598305805-4b9d79ae89bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbnRlbnQlMjBjcmVhdG9yJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjQ4MzIxOXww&ixlib=rb-4.1.0&q=80&w=400";

const SECTION_LABELS = {
  "user-info": "User Information",
  "content-preferences": "Content Preferences",
  "app-settings": "App Settings",
  "usage-stats": "Usage Statistics",
  "account-security": "Account & Security",
};

const FONT = "'Inter', system-ui, sans-serif";

/* ─── Theme token sets ─────────────────────────── */
const DARK_TOKENS = {
  bg: "#0A0A0A",
  surface: "#111111",
  border: "rgba(255,255,255,0.07)",
  divider: "rgba(255,255,255,0.06)",
  textPri: "#F5F5F5",
  textSec: "rgba(255,255,255,0.45)",
  hoverBg: "rgba(255,255,255,0.05)",
  inputBg: "rgba(255,255,255,0.05)",
  activeBg: "#fff",
  activeText: "#000",
  activeTextSec: "rgba(0,0,0,0.5)",
  dropdownBg: "#161616",
};

export default function ProfileWrapper({
  onGoHome,
  onGoBack,
  userName,
  onSignOut,
  userProfile,
  onUpdateProfile,
  user,
}) {
  const [activeSection, setActiveSection] = useState("user-info");

  // Make #root fill viewport so our container can scroll inside it
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.height = "100vh";
      root.style.overflow = "hidden";
    }
    return () => {
      if (root) {
        root.style.height = "";
        root.style.overflow = "";
      }
    };
  }, []);

  const [profile, setProfile] = useState(() => ({
    displayName: userProfile?.displayName || userName || user?.name || "User",
    email: userProfile?.email || user?.email || "",
    bio: userProfile?.bio || "",
    avatarUrl: userProfile?.avatarUrl || user?.picture || AVATAR_URL,
    isGoogleSignIn: userProfile?.isGoogleSignIn ?? user?.provider === "google",
    passwordHash: userProfile?.passwordHash || "",
  }));

  const [preferences, setPreferences] = useState(() => ({
    niche: userProfile?.niche || "",
    platforms: userProfile?.platforms || [],
    targetAudience: userProfile?.targetAudience || "",
    toneStyle: userProfile?.toneStyle || "",
  }));

  const [appSettings, setAppSettings] = useState(() => ({
    theme: userProfile?.theme || "dark",
    defaultAIModel: userProfile?.defaultAIModel || "claude-3-5-sonnet",
    autoSaveInterval: userProfile?.autoSaveInterval ?? 60,
    cloudSync: userProfile?.cloudSync ?? true,
  }));

  const [usageStats] = useState(() => ({
    workflowsCreated: userProfile?.workflowsCreated ?? 0,
    aiGenerationsUsed: userProfile?.aiGenerationsUsed ?? 0,
    accountCreated:
      userProfile?.accountCreated ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    lastSynced: userProfile?.lastSynced || "Never",
  }));

  // Recent activity stored in localStorage
  const [recentActivity, setRecentActivity] = useState(() => {
    try {
      const stored = localStorage.getItem("nexusflow_recent_activity");
      return stored
        ? JSON.parse(stored)
        : [
            {
              action: "Generated YouTube script",
              time: "2 hours ago",
              icon: "✍️",
            },
            { action: "Created new workflow", time: "Yesterday", icon: "⚡" },
            { action: "Cloud sync completed", time: "Yesterday", icon: "☁️" },
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
          ];
    } catch {
      return [];
    }
  });

  // Helper to log an activity
  const logActivity = useCallback((action, icon) => {
    setRecentActivity((prev) => {
      const next = [
        { action, time: "Just now", icon },
        ...prev.slice(0, 9), // keep last 10
      ];
      localStorage.setItem("nexusflow_recent_activity", JSON.stringify(next));
      return next;
    });
  }, []);

  // Refs for latest state
  const profileRef = useRef(profile);
  const preferencesRef = useRef(preferences);
  const appSettingsRef = useRef(appSettings);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);
  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  // Persist merged data
  const persist = useCallback(
    (p, pref, s) => {
      if (!onUpdateProfile) return;
      onUpdateProfile({
        ...(userProfile || {}),
        displayName: p.displayName,
        email: p.email,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
        isGoogleSignIn: p.isGoogleSignIn,
        passwordHash: p.passwordHash,
        niche: pref.niche,
        platforms: pref.platforms,
        targetAudience: pref.targetAudience,
        toneStyle: pref.toneStyle,
        theme: s.theme,
        defaultAIModel: s.defaultAIModel,
        autoSaveInterval: s.autoSaveInterval,
        cloudSync: s.cloudSync,
      });
    },
    [onUpdateProfile, userProfile],
  );

  const handleProfileChange = useCallback(
    (updates) => {
      setProfile((prev) => {
        const next = { ...prev, ...updates };
        setTimeout(
          () => persist(next, preferencesRef.current, appSettingsRef.current),
          0,
        );
        return next;
      });
      if (updates.displayName) logActivity("Updated display name", "✏️");
      if (updates.bio) logActivity("Updated bio", "📝");
      if (updates.avatarUrl) logActivity("Changed profile picture", "📷");
    },
    [persist, logActivity],
  );

  const handlePreferencesChange = useCallback(
    (updates) => {
      setPreferences((prev) => {
        const next = { ...prev, ...updates };
        setTimeout(
          () => persist(profileRef.current, next, appSettingsRef.current),
          0,
        );
        return next;
      });
      if (updates.niche) logActivity(`Changed niche to ${updates.niche}`, "🎯");
      if (updates.platforms) logActivity("Updated target platforms", "📱");
      if (updates.targetAudience)
        logActivity(`Changed audience to ${updates.targetAudience}`, "👥");
      if (updates.toneStyle)
        logActivity(`Changed tone to ${updates.toneStyle}`, "🎨");
    },
    [persist, logActivity],
  );

  const handleAppSettingsChange = useCallback(
    (updates) => {
      setAppSettings((prev) => {
        const next = { ...prev, ...updates };
        setTimeout(
          () => persist(profileRef.current, preferencesRef.current, next),
          0,
        );
        return next;
      });
      if (updates.theme) logActivity(`Switched to ${updates.theme} mode`, "🎨");
      if (updates.defaultAIModel) logActivity("Changed AI model", "🤖");
      if (updates.cloudSync !== undefined)
        logActivity(
          updates.cloudSync ? "Enabled cloud sync" : "Disabled cloud sync",
          "☁️",
        );
    },
    [persist, logActivity],
  );

  // Password update handler
  const handlePasswordUpdate = useCallback(
    (newPasswordHash) => {
      setProfile((prev) => {
        const next = { ...prev, passwordHash: newPasswordHash };
        setTimeout(
          () => persist(next, preferencesRef.current, appSettingsRef.current),
          0,
        );
        return next;
      });
      logActivity("Password updated", "🔒");
    },
    [persist, logActivity],
  );

  // Always dark theme
  const T = DARK_TOKENS;

  // CSS custom properties for child components
  const themeVars = {
    "--pf-bg": T.bg,
    "--pf-surface": T.surface,
    "--pf-border": T.border,
    "--pf-divider": T.divider,
    "--pf-text-pri": T.textPri,
    "--pf-text-sec": T.textSec,
    "--pf-hover-bg": T.hoverBg,
    "--pf-input-bg": T.inputBg,
    "--pf-active-bg": T.activeBg,
    "--pf-active-text": T.activeText,
    "--pf-active-text-sec": T.activeTextSec,
    "--pf-dropdown-bg": T.dropdownBg,
  };

  const renderSection = () => {
    switch (activeSection) {
      case "user-info":
        return (
          <UserInfoSection profile={profile} onChange={handleProfileChange} />
        );
      case "content-preferences":
        return (
          <ContentPreferencesSection
            preferences={preferences}
            onChange={handlePreferencesChange}
          />
        );
      case "app-settings":
        return (
          <AppSettingsSection
            settings={appSettings}
            onChange={handleAppSettingsChange}
          />
        );
      case "usage-stats":
        return (
          <UsageStatsSection
            stats={usageStats}
            recentActivity={recentActivity}
          />
        );
      case "account-security":
        return (
          <AccountSecuritySection
            isGoogleSignIn={profile.isGoogleSignIn}
            onSignOut={onSignOut || (() => alert("Signing out..."))}
            onDeleteAccount={() => alert("Account deletion requested.")}
            onPasswordUpdate={handlePasswordUpdate}
          />
        );
    }
  };

  return (
    <div
      className="profile-page-root"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        fontFamily: FONT,
        color: T.textPri,
        overflowY: "scroll",
        overflowX: "hidden",
        transition: "background 0.3s, color 0.3s",
        ...themeVars,
      }}
    >
      <style>{`
        .profile-page-root::-webkit-scrollbar {
          width: 8px;
        }
        .profile-page-root::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        .profile-page-root::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 4px;
          border: 2px solid #0A0A0A;
        }
        .profile-page-root::-webkit-scrollbar-thumb:hover {
          background: #252525;
        }
        .profile-page-root::-webkit-scrollbar-button {
          display: none;
          height: 0;
          width: 0;
        }
        .profile-page-root {
          scrollbar-color: #1a1a1a #0A0A0A;
          scrollbar-width: thin;
        }
      `}</style>
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: 60,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
          display: "flex",
          alignItems: "center",
          transition: "background 0.3s, border-color 0.3s",
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
          {/* Left — Clickable logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {/* Clickable NexusFlow logo → home */}
            <button
              onClick={onGoHome}
              title="Go to Home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <img
                src="/logo.svg"
                alt="NexusFlow"
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.textPri,
                  letterSpacing: "-0.02em",
                }}
              >
                NexusFlow
              </span>
            </button>

            <span
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: 14,
                margin: "0 2px",
              }}
            >
              ·
            </span>
            <span style={{ fontSize: 13, color: T.textSec }}>
              {SECTION_LABELS[activeSection]}
            </span>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              <Bell size={17} strokeWidth={1.5} />,
              <Settings2 size={17} strokeWidth={1.5} />,
            ].map((icon, i) => (
              <button
                key={i}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: T.textSec,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = T.textPri;
                  e.currentTarget.style.background = T.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = T.textSec;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {icon}
              </button>
            ))}
            <button
              onClick={onSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                border: "none",
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
                color: T.textSec,
                fontSize: 13,
                fontWeight: 400,
                fontFamily: FONT,
                letterSpacing: "-0.01em",
                transition: "color 0.15s, background 0.15s",
                marginLeft: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.textPri;
                e.currentTarget.style.background = T.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.textSec;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={15} strokeWidth={1.5} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Floating Back Button ── */}
      <button
        onClick={onGoHome}
        title="Back to Home"
        style={{
          position: "fixed",
          left: "calc(50% - 612px)",
          top: 80,
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${T.border}`,
          background: "rgba(17,17,17,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          cursor: "pointer",
          color: T.textSec,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = T.textPri;
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = T.textSec;
          e.currentTarget.style.background = "rgba(17,17,17,0.85)";
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </button>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          padding: "40px 28px 80px 28px",
          boxSizing: "border-box",
        }}
      >
        {/* Desktop */}
        <div className="hidden md:flex" style={{ gap: 28 }}>
          <ProfileSidebar
            activeSection={activeSection}
            onSelect={setActiveSection}
            avatarUrl={profile.avatarUrl}
            displayName={profile.displayName}
            email={profile.email}
            onGoBack={onGoBack}
          />
          <div style={{ flex: 1, minWidth: 0 }}>{renderSection()}</div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">{renderSection()}</div>
      </main>

      {/* Mobile bottom nav */}
      <div
        className="md:hidden"
        style={{ position: "sticky", bottom: 0, zIndex: 40 }}
      >
        <ProfileTabBar
          activeSection={activeSection}
          onSelect={setActiveSection}
        />
      </div>
    </div>
  );
}
