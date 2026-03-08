// ── NexusFlow — Main Application ──
import { useState, useCallback, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import OnboardingFlow from "./components/OnboardingFlow";
import HomePage from "./components/HomePage";
import AuthScreen from "./components/AuthScreen";
import ProfileWrapper from "./components/profile/ProfileWrapper";
import CaptionGenerator from "./components/CaptionGenerator";
import FlowCanvas from "./components/FlowCanvas";

import {
  getWorkflow,
  setCurrentUserId,
  getProfileKey,
  syncWithCloud,
  pushToCloud,
} from "./utils/workflowManager";
import { useAuth } from "./contexts/AuthContext";

// ── App Root (with Auth Gate + Onboarding Gate + Home/Canvas Routing) ──
export default function App() {
  const { user, userId, isLoading, signOut } = useAuth();

  // Set the user ID in the workflow manager for per-user data isolation
  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [userId]);

  const [userProfile, setUserProfile] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load per-user profile and sync with cloud when userId changes
  useEffect(() => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    // Load local profile first (instant)
    let localProfile = null;
    try {
      const profileKey = getProfileKey();
      const saved = localStorage.getItem(profileKey);
      localProfile = saved ? JSON.parse(saved) : null;
      setUserProfile(localProfile);
    } catch {
      setUserProfile(null);
    }

    // Then sync with cloud (async)
    setIsSyncing(true);
    syncWithCloud(localProfile)
      .then((mergedProfile) => {
        if (mergedProfile) {
          setUserProfile(mergedProfile);
          const profileKey = getProfileKey();
          localStorage.setItem(profileKey, JSON.stringify(mergedProfile));
        }
      })
      .catch(() => {})
      .finally(() => setIsSyncing(false));
  }, [userId]);

  // ── URL-based view routing ──
  const VIEW_PATH_MAP = {
    home: "/",
    canvas: "/canvas",
    profile: "/profile",
    "caption-generator": "/caption-generator",
  };

  function getViewFromPath(pathname) {
    const p = pathname.replace(/\/+$/, "") || "/";
    if (p === "/profile") return "profile";
    if (p === "/caption-generator") return "caption-generator";
    if (p === "/canvas") return "canvas";
    if (p === "/login" || p === "/signup") return "home";
    return "home";
  }

  const [currentView, setCurrentView] = useState(() =>
    getViewFromPath(window.location.pathname),
  );
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);
  const [activeWorkflowData, setActiveWorkflowData] = useState(null);

  // Navigate and update URL
  const navigateTo = useCallback((view) => {
    const path = VIEW_PATH_MAP[view] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState({ view }, "", path);
    }
    setCurrentView(view);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Mapping tables: onboarding values → display labels
  const NICHE_MAP = {
    food: "Food & Cooking",
    tech: "Technology",
    fashion: "Beauty & Lifestyle",
    college: "Education",
    fitness: "Fitness & Health",
    travel: "Travel",
    finance: "Finance",
    other: "Entertainment",
  };
  const AUDIENCE_MAP = {
    students: "Students",
    professionals: "Professionals",
    general: "General Public",
    creators: "Niche Enthusiasts",
    business: "Entrepreneurs",
  };
  const TONE_MAP = {
    funny: "Humorous",
    professional: "Professional",
    casual: "Casual & Friendly",
    motivational: "Inspirational",
    bold: "Storytelling",
  };
  const PLATFORM_MAP = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    youtube: "YouTube",
    blog: "Blog / Newsletter",
  };

  const handleOnboardingComplete = (answers) => {
    // Merge onboarding answers with auth user data into a full profile
    const fullProfile = {
      // User identity (from auth)
      displayName: user?.name || user?.email?.split("@")[0] || "User",
      email: user?.email || "",
      avatarUrl: user?.picture || "",
      isGoogleSignIn: user?.provider === "google",
      bio: "",
      passwordHash: "",
      // Content preferences (mapped to display labels)
      niche: NICHE_MAP[answers.niche] || answers.niche || "Technology",
      platforms: (answers.platforms || []).map((p) => PLATFORM_MAP[p] || p),
      targetAudience:
        AUDIENCE_MAP[answers.audience] || answers.audience || "General Public",
      toneStyle: TONE_MAP[answers.tone] || answers.tone || "Casual & Friendly",
      // App settings defaults
      theme: "dark",
      defaultAIModel: "claude-3-5-sonnet",
      autoSaveInterval: 60,
      cloudSync: true,
      // Usage stats
      workflowsCreated: 0,
      aiGenerationsUsed: 0,
      accountCreated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastSynced: "Just now",
    };
    const profileKey = getProfileKey();
    localStorage.setItem(profileKey, JSON.stringify(fullProfile));
    setUserProfile(fullProfile);
    // Push profile to cloud
    pushToCloud(fullProfile);
  };

  const handleResetProfile = () => {
    const profileKey = getProfileKey();
    localStorage.removeItem(profileKey);
    setUserProfile(null);
    navigateTo("home");
  };

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUserProfile(null);
    navigateTo("home");
    setActiveWorkflowId(null);
    setActiveWorkflowData(null);
  }, [signOut, navigateTo]);

  // Open an existing workflow
  const handleOpenWorkflow = useCallback(
    (id) => {
      const wf = getWorkflow(id);
      if (wf) {
        setActiveWorkflowId(id);
        setActiveWorkflowData(wf);
        navigateTo("canvas");
      }
    },
    [navigateTo],
  );

  // Create a new workflow (optionally from a template or seed text)
  const handleCreateWorkflow = useCallback(
    (id, template, seedText) => {
      setActiveWorkflowId(id);
      const wf = getWorkflow(id);
      if (template) {
        setActiveWorkflowData({ ...wf, _template: template });
      } else if (seedText) {
        setActiveWorkflowData({ ...wf, _seedText: seedText });
      } else {
        setActiveWorkflowData(wf);
      }
      navigateTo("canvas");
    },
    [navigateTo],
  );

  // Navigate back to home
  const handleGoHome = useCallback(() => {
    setActiveWorkflowId(null);
    setActiveWorkflowData(null);
    navigateTo("home");
  }, [navigateTo]);

  // Navigate to profile
  const handleGoProfile = useCallback(() => {
    navigateTo("profile");
  }, [navigateTo]);

  // Navigate back to canvas/workspace
  const handleGoCanvas = useCallback(() => {
    navigateTo("canvas");
  }, [navigateTo]);

  // Navigate to caption generator
  const handleGoCaptionGenerator = useCallback(() => {
    navigateTo("caption-generator");
  }, [navigateTo]);

  // Update profile
  const handleUpdateProfile = useCallback((updated) => {
    const profileKey = getProfileKey();
    localStorage.setItem(profileKey, JSON.stringify(updated));
    setUserProfile(updated);
    pushToCloud(updated);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Loading NexusFlow...</p>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    // Make sure URL is /login or /signup when on the auth screen
    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    if (currentPath !== "/login" && currentPath !== "/signup") {
      window.history.replaceState({}, "", "/login");
    }
    return <AuthScreen />;
  }

  // Once authenticated, redirect away from /login or /signup
  if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/signup"
  ) {
    window.history.replaceState({}, "", "/");
  }

  // Onboarding gate (per-user)
  if (!userProfile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (currentView === "profile") {
    return (
      <ProfileWrapper
        user={user}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onSignOut={handleSignOut}
        onGoHome={handleGoHome}
        onGoBack={handleGoCanvas}
        userName={user?.name || user?.email || "User"}
      />
    );
  }

  if (currentView === "caption-generator") {
    return (
      <CaptionGenerator
        onGoHome={handleGoHome}
        onSignOut={handleSignOut}
        userName={user?.name || user?.email || "User"}
        userProfile={userProfile}
      />
    );
  }

  if (currentView === "home") {
    return (
      <HomePage
        userProfile={userProfile}
        onOpenWorkflow={handleOpenWorkflow}
        onCreateWorkflow={handleCreateWorkflow}
        onResetProfile={handleResetProfile}
        onSignOut={handleSignOut}
        userName={user?.name || user?.email || "User"}
        onGoProfile={handleGoProfile}
        onGoCaptionGenerator={handleGoCaptionGenerator}
      />
    );
  }

  return (
    <ReactFlowProvider key={activeWorkflowId}>
      <FlowCanvas
        userProfile={userProfile}
        onResetProfile={handleResetProfile}
        workflowId={activeWorkflowId}
        onGoHome={handleGoHome}
        initialWorkflowData={activeWorkflowData}
        onSignOut={handleSignOut}
        userName={user?.name || user?.email || "User"}
        onGoProfile={handleGoProfile}
      />
    </ReactFlowProvider>
  );
}
