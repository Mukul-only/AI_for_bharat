// ── NexusFlow Auth Screen — Minimalist Dark Mode ──

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react";

// ── Google Logo (Official Colors) ──
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 000 24c0 3.77.9 7.34 2.56 10.53l7.97-5.94z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// ── Canvas: Abstract Network Lines ──
function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(dpr, dpr);
    };
    resize();

    const w = canvas.parentElement.getBoundingClientRect().width;
    const h = canvas.parentElement.getBoundingClientRect().height;
    const nodes = Array.from({ length: 18 }, () => ({
      x: 80 + Math.random() * (w - 160),
      y: 80 + Math.random() * (h - 160),
      r: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    let animId;
    const draw = () => {
      const cw = canvas.parentElement.getBoundingClientRect().width;
      const ch = canvas.parentElement.getBoundingClientRect().height;
      ctx.clearRect(0, 0, cw, ch);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 40 || n.x > cw - 40) n.vx *= -1;
        if (n.y < 40 || n.y > ch - 40) n.vy *= -1;
      });

      // Connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = 0.06 * (1 - dist / 200);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      nodes.forEach((n) => {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mn-canvas" />;
}

export default function AuthScreen() {
  const { signIn, signUp, confirmSignUp, signInWithGoogle } = useAuth();

  // Determine initial mode from URL
  const getInitialMode = () => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/signup") return "signup";
    return "signin";
  };

  const [mode, setMode] = useState(getInitialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Listen for browser back/forward to keep mode in sync with URL
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      if (path === "/signup") setMode("signup");
      else setMode("signin");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const result = await signIn(email, password);
        if (result?.nextStep?.signInStep === "CONFIRM_SIGN_UP")
          setMode("verify");
      } catch (err) {
        setError(err.message || "Sign in failed.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn],
  );

  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setLoading(true);
      try {
        const result = await signUp(email, password, name);
        if (result?.isSignUpComplete === false) setMode("verify");
      } catch (err) {
        setError(err.message || "Sign up failed.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, name, signUp],
  );

  const handleVerify = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        await confirmSignUp(email, code);
        await signIn(email, password);
      } catch (err) {
        setError(err.message || "Verification failed.");
      } finally {
        setLoading(false);
      }
    },
    [email, code, password, confirmSignUp, signIn],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setError("");
    // Don't set loading=true here — the GSI popup is external.
    // Setting loading would disable buttons while the popup is open,
    // and if the popup is closed, we'd be stuck.
    try {
      setLoading(true);
      await signInWithGoogle();
      // If we get here, the sign-in succeeded — user state is already updated
    } catch (err) {
      // If user just closed the popup, don't show an error
      if (err.message === "__popup_closed__") {
        // Silently recover — user cancelled
      } else {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle]);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    // Update URL to reflect login/signup mode
    const path = m === "signup" ? "/signup" : "/login";
    if (window.location.pathname !== path) {
      window.history.pushState({ mode: m }, "", path);
    }
  };

  return (
    <div className={`mn-auth ${mounted ? "mn-auth--visible" : ""}`}>
      {/* ── LEFT — Dark Hero ── */}
      <div className="mn-auth-hero ">
        <NetworkCanvas />
        <div className="mn-auth-hero-content">
          {/* Original NexusFlow Logo */}
          <div className="mn-auth-hero-badge">
            <img
              src="/logo.svg"
              alt="NexusFlow"
              className="mn-auth-hero-logo-img"
            />
            <span>NexusFlow</span>
          </div>
          <h1 className="mn-auth-hero-title">
            Build smarter
            <br />
            content workflows.
          </h1>
          <p className="mn-auth-hero-sub">
            AI-powered platform for creating, repurposing, and distributing
            content across every channel.
          </p>
        </div>
        <div className="mn-auth-hero-footer">
          <span>© 2025 NexusFlow</span>
        </div>
      </div>

      {/* ── RIGHT — Dark Form ── */}
      <div className="mn-auth-form-side">
        <div className="mn-auth-form-container">
          {/* Logo */}
          <div className="mn-auth-logo">
            <img src="/logo.svg" alt="NexusFlow" className="mn-auth-logo-img" />
            <span>NexusFlow</span>
          </div>

          {mode === "verify" ? (
            <>
              <div className="mn-auth-header">
                <h2>Verify your email</h2>
                <p>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleVerify} className="mn-auth-form">
                <div className="mn-auth-field">
                  <label>Verification Code</label>
                  <div className="mn-auth-input-row">
                    <Shield size={15} className="mn-auth-field-icon" />
                    <input
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                </div>
                {error && <div className="mn-auth-error">{error}</div>}
                <button
                  type="submit"
                  className="mn-auth-submit"
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <Loader2 size={16} className="mn-spin" />
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mn-auth-header">
                <h2>{mode === "signin" ? "Sign in" : "Create account"}</h2>
                <p>
                  {mode === "signin"
                    ? "Enter your credentials to continue"
                    : "Start building with NexusFlow"}
                </p>
              </div>

              {/* Google */}
              <button
                className="mn-auth-google"
                onClick={handleGoogleSignIn}
                disabled={loading}
                type="button"
              >
                <GoogleLogo />
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="mn-auth-or">
                <div className="mn-auth-or-line" />
                <span>or</span>
                <div className="mn-auth-or-line" />
              </div>

              <form
                onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
                className="mn-auth-form"
              >
                {mode === "signup" && (
                  <div className="mn-auth-field">
                    <label>Full Name</label>
                    <div className="mn-auth-input-row">
                      <User size={15} className="mn-auth-field-icon" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="mn-auth-field">
                  <label>Email</label>
                  <div className="mn-auth-input-row">
                    <Mail size={15} className="mn-auth-field-icon" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mn-auth-field">
                  <div className="mn-auth-field-top">
                    <label>Password</label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        className="mn-auth-forgot"
                        tabIndex={-1}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="mn-auth-input-row">
                    <Lock size={15} className="mn-auth-field-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="mn-auth-eye"
                      onClick={() => setShowPassword((p) => !p)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && <div className="mn-auth-error">{error}</div>}
                <button
                  type="submit"
                  className="mn-auth-submit"
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <Loader2 size={16} className="mn-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "signin" ? "Sign In" : "Create Account"}
                      </span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="mn-auth-switch">
                {mode === "signin" ? (
                  <p>
                    Don't have an account?{" "}
                    <button onClick={() => switchMode("signup")}>
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button onClick={() => switchMode("signin")}>
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
