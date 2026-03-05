// ── ImageNode — AI image generation ──

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Image, Download, Sparkles, Wand2 } from "lucide-react";
import { generateImage } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";

const STYLES = [
  { value: "photorealistic", label: "📷 Photo" },
  { value: "illustration", label: "🎨 Illustration" },
  { value: "minimal", label: "⬜ Minimal" },
  { value: "abstract", label: "🌀 Abstract" },
];

function ImageNode({ data, id }) {
  // Read everything from data props (set by RightPanel via onNodeUpdate)
  const style = data.style || "photorealistic";
  const imageUrl = data.imageUrl || "";

  // Local-only state (not settable from RightPanel)
  const [loading, setLoading] = useState(false);
  const [craftedPrompt, setCraftedPrompt] = useState("");
  const [loadingPhase, setLoadingPhase] = useState("");

  const { setNodes } = useReactFlow();
  const findSourceText = useNodeSource(id);

  // Helper to update this node's data
  const updateData = useCallback(
    (updates) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      );
    },
    [id, setNodes],
  );

  const handleStyleChange = useCallback(
    (newStyle) => {
      updateData({ style: newStyle });
    },
    [updateData],
  );

  const handleGenerate = useCallback(async () => {
    let seedText = data.promptOverride?.trim() || findSourceText();
    if (!seedText) {
      showError(
        "Connect a content node first! Drag from Seed / Platform → this node.",
      );
      return;
    }
    // Prepend custom AI instructions if available
    if (data.customInstructions?.trim()) {
      seedText = `Instructions: ${data.customInstructions.trim()}\n\n${seedText}`;
    }
    // Append negative prompt if available
    if (data.negativePrompt?.trim()) {
      seedText += `\n\nNegative: ${data.negativePrompt.trim()}`;
    }
    setLoading(true);
    setLoadingPhase("Crafting prompt...");
    try {
      setTimeout(() => setLoadingPhase("Generating image..."), 800);
      const result = await generateImage(seedText, style);
      updateData({ imageUrl: result.imageUrl });
      if (result.craftedPrompt) setCraftedPrompt(result.craftedPrompt);
      showSuccess("Image generated!", { accent: "amber" });
    } catch (err) {
      if (err.name !== "AbortError") {
        showError(`Image generation failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setLoadingPhase("");
    }
  }, [
    findSourceText,
    style,
    data.promptOverride,
    data.negativePrompt,
    data.customInstructions,
    updateData,
  ]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
  }, [imageUrl]);

  // Watch for external generate trigger (from RightPanel buttons)
  const lastTriggerRef = useRef(null);
  useEffect(() => {
    if (
      data.generateTrigger &&
      data.generateTrigger !== lastTriggerRef.current &&
      !loading
    ) {
      lastTriggerRef.current = data.generateTrigger;
      handleGenerate();
    }
  }, [data.generateTrigger, handleGenerate, loading]);

  return (
    <div className="nexus-node image-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Image />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Image Generator"}
        </div>
        <span className="nexus-node-badge">VISUAL</span>
      </div>

      <div className="nexus-node-body">
        <div className="node-control-label" style={{ marginBottom: 8 }}>
          Style
        </div>
        <div className="image-style-grid">
          {STYLES.map((s) => (
            <button
              key={s.value}
              className={`image-style-option nodrag ${style === s.value ? "active" : ""}`}
              onClick={() => handleStyleChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div
          className="image-preview"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: `${data.borderRadius || 0}px`,
          }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="Generated content"
                style={{
                  filter: `brightness(${data.filter_brightness ?? 100}%) contrast(${data.filter_contrast ?? 100}%) saturate(${data.filter_saturation ?? 100}%) blur(${data.filter_blur ?? 0}px)`,
                  borderRadius: `${data.borderRadius || 0}px`,
                }}
              />
              {/* Color tint overlay */}
              {data.colorTint && data.colorTint !== "none" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: `${data.borderRadius || 0}px`,
                    pointerEvents: "none",
                    background:
                      {
                        warm: "rgba(217,119,6,0.18)",
                        cool: "rgba(59,130,246,0.18)",
                        pink: "rgba(236,72,153,0.18)",
                        green: "rgba(16,185,129,0.18)",
                        sepia: "rgba(146,64,14,0.25)",
                      }[data.colorTint] || "transparent",
                    mixBlendMode: "overlay",
                  }}
                />
              )}
            </>
          ) : (
            <div className="image-preview-empty">
              <Image />
              <span>Generate an image from your content</span>
            </div>
          )}
        </div>

        {craftedPrompt && (
          <div className="image-crafted-prompt nodrag">
            <div className="image-prompt-label">
              <Wand2 size={10} />
              AI-crafted prompt
            </div>
            <p className="image-prompt-text">{craftedPrompt}</p>
          </div>
        )}
      </div>

      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-generate nodrag"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              {loadingPhase || "Creating..."}
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Image
            </>
          )}
        </button>
        {imageUrl && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={handleDownload}
          >
            <Download size={14} />
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}

export default memo(ImageNode);
