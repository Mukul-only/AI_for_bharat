import { useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  LogOut,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  FileText,
  Loader2,
  Camera,
} from "lucide-react";
import { generateCaptionsFromPhoto } from "../api";

/* ─── Design tokens ───────────────── */
const BG = "#000000";
const SURFACE = "#09090B";
const BORDER = "#1F1F22";
const DIVIDER = "#1F1F22";
const TEXT_PRI = "#FAFAFA";
const TEXT_SEC = "#A1A1AA";
const ACCENT = "#A78BFA";
const ACCENT_BG = "rgba(167,139,250,0.1)";
const FONT = "'Inter', system-ui, sans-serif";

/* ─── Platform config ─────────────── */
const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    bg: "rgba(228,64,95,0.1)",
    maxLen: 2200,
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: Twitter,
    color: "#1DA1F2",
    bg: "rgba(29,161,242,0.1)",
    maxLen: 280,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.1)",
    maxLen: 3000,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    bg: "rgba(255,0,0,0.1)",
    maxLen: 5000,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    maxLen: 63206,
  },
  {
    id: "blog",
    label: "Blog Post",
    icon: FileText,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    maxLen: null,
  },
];

export default function CaptionGenerator({
  onGoHome,
  onSignOut,
  userName,
  userProfile,
}) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    PLATFORMS.map((p) => p.id),
  );
  const [tone, setTone] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Handle file upload
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // Generate captions
  const handleGenerate = useCallback(async () => {
    if (!description.trim() && !uploadedImage) return;

    const seedText =
      description.trim() ||
      "A beautiful photo capturing an interesting moment worth sharing with the world";

    setIsGenerating(true);
    setResults(null);

    try {
      const profile = userProfile
        ? {
            niche: userProfile.niche,
            audience: userProfile.targetAudience,
            tone: userProfile.toneStyle,
            platforms: userProfile.platforms,
          }
        : null;

      const captions = await generateCaptionsFromPhoto(
        seedText,
        selectedPlatforms,
        tone,
        profile,
      );

      setResults(captions);
      if (captions.length > 0) setActiveTab(captions[0].platform);

      // Scroll to results after a tick
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      console.error("Caption generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [description, uploadedImage, selectedPlatforms, tone, userProfile]);

  // Copy to clipboard
  const copyCaption = async (text, platformId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(platformId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(platformId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const canGenerate =
    (description.trim() || uploadedImage) && selectedPlatforms.length > 0;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BG,
        fontFamily: FONT,
        color: TEXT_PRI,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          flexShrink: 0,
          zIndex: 40,
          height: 60,
          borderBottom: `1px solid ${BORDER}`,
          background: BG,
          display: "flex",
          alignItems: "center",
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
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <button
              onClick={onGoHome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
              }}
            >
              <img
                src="/logo.svg"
                alt="NexusFlow"
                style={{ width: 28, height: 28, objectFit: "contain" }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: TEXT_PRI,
                  letterSpacing: "-0.02em",
                }}
              >
                NexusFlow
              </span>
            </button>

            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
              ·
            </span>
            <span style={{ fontSize: 13, color: TEXT_SEC }}>
              Caption Generator
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                color: TEXT_SEC,
                fontSize: 13,
                fontFamily: FONT,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_PRI)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_SEC)}
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
          left: "max(24px, calc(50% - 460px))",
          top: 84,
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${BORDER}`,
          background: SURFACE,
          cursor: "pointer",
          color: TEXT_SEC,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = TEXT_PRI;
          e.currentTarget.style.background = "#18181B";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = TEXT_SEC;
          e.currentTarget.style.background = SURFACE;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <ArrowLeft size={18} strokeWidth={2} />
      </button>

      {/* ── Main content — scrollable single column ── */}
      <main
        style={{
          flex: 1,
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          padding: "40px 28px 100px",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: ACCENT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Camera size={22} style={{ color: ACCENT }} />
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #FAFAFA, #A1A1AA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Caption Generator
          </h1>
          <p style={{ fontSize: 15, color: TEXT_SEC, marginTop: 10 }}>
            Upload a photo, describe it, and get optimized captions for every
            platform
          </p>
        </div>

        {/* ── Upload zone ── */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${DIVIDER}`,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: TEXT_SEC,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              📷 Upload Photo (optional)
            </p>
          </div>

          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "32px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                border: `2px dashed ${dragOver ? ACCENT : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                margin: 12,
                transition: "border-color 0.2s, background 0.2s",
                background: dragOver ? "rgba(167,139,250,0.05)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                <Upload size={18} style={{ color: TEXT_PRI }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: TEXT_PRI,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Drag & drop your photo here
                </p>
                <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4 }}>
                  or click to browse · JPG, PNG, WebP
                </p>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", padding: 12 }}>
              <img
                src={imagePreview}
                alt="Uploaded"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  objectFit: "cover",
                  maxHeight: 220,
                  display: "block",
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <X size={14} />
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: TEXT_SEC,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {uploadedImage?.name} ·{" "}
                {(uploadedImage?.size / 1024).toFixed(0)} KB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* ── Description ── */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${DIVIDER}`,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: TEXT_SEC,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              📝 Describe your photo
            </p>
          </div>
          <div style={{ padding: 14 }}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A sunset at the beach with golden reflections on the water, perfect for a travel inspiration post..."
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.02)",
                color: TEXT_PRI,
                fontSize: 14,
                fontFamily: FONT,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.6,
                transition: "all 0.2s",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(167,139,250,0.5)";
                e.target.style.background = "rgba(255,255,255,0.03)";
                e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER;
                e.target.style.background = "rgba(255,255,255,0.02)";
                e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
              }}
            />
            <p
              style={{
                fontSize: 11,
                color: TEXT_SEC,
                marginTop: 6,
              }}
            >
              Describe what's in the photo — the AI uses this to craft
              platform-specific captions
            </p>
          </div>
        </div>

        {/* ── Tone + Platforms in a row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Tone slider */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT_SEC,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                🎨 Tone
              </p>
              <span style={{ fontSize: 11, color: TEXT_SEC }}>
                {tone > 60 ? "Casual" : tone < 40 ? "Professional" : "Balanced"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={tone}
              onChange={(e) => setTone(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: ACCENT,
                cursor: "pointer",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 10, color: TEXT_SEC }}>
                Professional
              </span>
              <span style={{ fontSize: 10, color: TEXT_SEC }}>Casual</span>
            </div>
          </div>

          {/* Platform selection */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: `1px solid ${DIVIDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT_SEC,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                📱 Platforms
              </p>
              <span style={{ fontSize: 11, color: TEXT_SEC }}>
                {selectedPlatforms.length} selected
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 4,
                padding: 6,
              }}
            >
              {PLATFORMS.map(({ id, label, icon: Icon, color, bg }) => {
                const active = selectedPlatforms.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${active ? color + "60" : BORDER}`,
                      background: active ? bg : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      fontFamily: FONT,
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: active ? `0 2px 8px ${color}15` : "none",
                    }}
                  >
                    <Icon
                      size={12}
                      style={{
                        color: active ? color : TEXT_SEC,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: active ? TEXT_PRI : TEXT_SEC,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Generate button ── */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "16px 0",
            borderRadius: 12,
            background:
              canGenerate && !isGenerating
                ? "linear-gradient(135deg, #A78BFA, #9333EA)"
                : SURFACE,
            color: canGenerate && !isGenerating ? "#FAFAFA" : TEXT_SEC,
            border: !canGenerate
              ? `1px solid ${BORDER}`
              : "1px solid transparent",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: canGenerate && !isGenerating ? "pointer" : "not-allowed",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            letterSpacing: "-0.01em",
            width: "100%",
            marginBottom: 24,
            boxShadow:
              canGenerate && !isGenerating
                ? "0 4px 14px rgba(167, 139, 250, 0.2)"
                : "none",
          }}
          onMouseEnter={(e) => {
            if (canGenerate && !isGenerating) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(167, 139, 250, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (canGenerate && !isGenerating) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(167, 139, 250, 0.2)";
            }
          }}
        >
          {isGenerating ? (
            <>
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Generating for {selectedPlatforms.length} platforms...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate All Captions
            </>
          )}
        </button>

        {/* ── Results ── */}
        {results && (
          <div ref={resultsRef}>
            {/* Section title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Sparkles size={14} style={{ color: ACCENT }} />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: TEXT_PRI,
                  margin: 0,
                }}
              >
                Generated Captions
              </h2>
              <span style={{ fontSize: 12, color: TEXT_SEC }}>
                · {results.length} platforms
              </span>
            </div>

            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                gap: 2,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px 14px 0 0",
                padding: "6px 6px 0",
                overflowX: "auto",
              }}
            >
              {results.map((r) => {
                const pConfig = PLATFORMS.find((p) => p.id === r.platform);
                if (!pConfig) return null;
                const active = activeTab === r.platform;
                const Icon = pConfig.icon;
                return (
                  <button
                    key={r.platform}
                    onClick={() => setActiveTab(r.platform)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: "8px 8px 0 0",
                      border: "none",
                      background: active ? SURFACE : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      fontFamily: FONT,
                      color: active ? TEXT_PRI : TEXT_SEC,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      borderBottom: active
                        ? `2px solid ${pConfig.color}`
                        : "2px solid transparent",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon
                      size={13}
                      style={{
                        color: active ? pConfig.color : TEXT_SEC,
                      }}
                    />
                    {pConfig.label}
                  </button>
                );
              })}
            </div>

            {/* Active caption content */}
            {results.map((r) => {
              if (r.platform !== activeTab) return null;
              const pConfig = PLATFORMS.find((p) => p.id === r.platform);
              if (!pConfig) return null;
              const text = r.generatedText || "";
              const Icon = pConfig.icon;
              return (
                <div
                  key={r.platform}
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                    padding: 0,
                  }}
                >
                  {/* Caption header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderBottom: `1px solid ${DIVIDER}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: pConfig.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={16} style={{ color: pConfig.color }} />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: TEXT_PRI,
                            margin: 0,
                          }}
                        >
                          {pConfig.label}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: TEXT_SEC,
                            marginTop: 1,
                          }}
                        >
                          {text.length} chars
                          {pConfig.maxLen &&
                            ` / ${pConfig.maxLen.toLocaleString()} max`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyCaption(text, r.platform)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        background:
                          copiedId === r.platform
                            ? "rgba(74,222,128,0.1)"
                            : "rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        color: copiedId === r.platform ? "#4ade80" : TEXT_SEC,
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: FONT,
                        transition: "all 0.15s",
                      }}
                    >
                      {copiedId === r.platform ? (
                        <>
                          <Check size={12} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Caption text */}
                  <div style={{ padding: "18px 20px" }}>
                    <pre
                      style={{
                        fontSize: 13,
                        color: TEXT_PRI,
                        fontFamily: FONT,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {text}
                    </pre>
                  </div>

                  {/* Character count bar */}
                  {pConfig.maxLen && (
                    <div style={{ padding: "0 20px 14px" }}>
                      <div
                        style={{
                          width: "100%",
                          height: 3,
                          borderRadius: 99,
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            width: `${Math.min((text.length / pConfig.maxLen) * 100, 100)}%`,
                            background:
                              text.length > pConfig.maxLen
                                ? "#f87171"
                                : text.length > pConfig.maxLen * 0.8
                                  ? "#f59e0b"
                                  : pConfig.color,
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Regenerate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 0",
                marginTop: 10,
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.03)",
                cursor: isGenerating ? "not-allowed" : "pointer",
                color: TEXT_SEC,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: FONT,
                transition: "all 0.15s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.color = TEXT_PRI;
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = TEXT_SEC;
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <RefreshCw size={13} />
              Regenerate All Captions
            </button>
          </div>
        )}
      </main>

      {/* Spinner animation */}
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
