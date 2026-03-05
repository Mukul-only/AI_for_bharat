// ── PlatformNode — Twitter / LinkedIn / Instagram / Blog / YouTube generator ──

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import {
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Youtube,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { generateContent } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";
import useClipboard from "../hooks/useClipboard";

const PLATFORM_CONFIG = {
  twitter: {
    icon: Twitter,
    label: "Twitter / X Thread",
    className: "twitter-node",
    charLimit: 2800,
    badgeText: "SOCIAL",
  },
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn Post",
    className: "linkedin-node",
    charLimit: 3000,
    badgeText: "PROFESSIONAL",
  },
  instagram: {
    icon: Instagram,
    label: "Instagram Caption",
    className: "instagram-node",
    charLimit: 2200,
    badgeText: "VISUAL",
  },
  blog: {
    icon: BookOpen,
    label: "Blog Article",
    className: "blog-node",
    charLimit: 15000,
    badgeText: "LONG-FORM",
  },
  youtube: {
    icon: Youtube,
    label: "YouTube Script",
    className: "youtube-node",
    charLimit: 10000,
    badgeText: "VIDEO",
  },
};

function PlatformNode({ data, id }) {
  const platform = data.platform || "twitter";
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  // Read tone and length from data props (set by RightPanel) with local fallback
  const tone = data.tone ?? 50;
  const length = data.length || "medium";
  const [output, setOutput] = useState(data.output || "");
  const [loading, setLoading] = useState(false);

  const { setNodes } = useReactFlow();
  const findSourceText = useNodeSource(id);
  const { copy, copied } = useClipboard({
    successMessage: "Copied to clipboard!",
  });

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

  // Sync output when data.output changes externally (e.g. from Generate All)
  useEffect(() => {
    if (data.output && data.output !== output) {
      setOutput(data.output);
    }
  }, [data.output]);

  const handleGenerate = useCallback(async () => {
    let seedText = findSourceText();
    if (!seedText) {
      showError("Connect a Seed Node first! Drag from Seed → this node.");
      return;
    }
    // Prepend custom AI instructions if available
    if (data.customInstructions?.trim()) {
      seedText = `Instructions: ${data.customInstructions.trim()}\n\n${seedText}`;
    }
    // Append language preference
    if (data.language && data.language !== "english") {
      seedText += `\n\nPlease write the output in ${data.language}.`;
    }
    // Append output format preference
    if (data.outputFormat && data.outputFormat !== "default") {
      const formatMap = {
        thread: "Write as a thread with numbered points.",
        bullet_points: "Write as bullet points.",
        story: "Write as a personal story narrative.",
        actionable: "Write as an actionable step-by-step guide.",
        listicle: "Write as a listicle with clear numbered items.",
      };
      seedText += `\n\n${formatMap[data.outputFormat] || ""}`;
    }
    setLoading(true);
    try {
      const result = await generateContent(
        seedText,
        platform,
        tone,
        length,
        data.userProfile,
      );
      setOutput(result.generatedText);
      // Store output in node data so RightPanel Insights can read it
      updateData({ output: result.generatedText });
      if (data.onOutputChange) data.onOutputChange(id, result.generatedText);
      showSuccess(`${config.label} generated!`);
    } catch (err) {
      if (err.name !== "AbortError") {
        setOutput(`❌ Error: ${err.message}`);
        showError(`Generation failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [
    findSourceText,
    platform,
    tone,
    length,
    id,
    data.userProfile,
    data.customInstructions,
    data.language,
    data.outputFormat,
    data.onOutputChange,
    config.label,
    updateData,
  ]);

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

  const charCount = output.length;
  const charPct = (charCount / config.charLimit) * 100;
  const charClass =
    charPct > 100
      ? "char-count-over"
      : charPct > 80
        ? "char-count-warn"
        : "char-count-ok";

  return (
    <div className={`nexus-node ${config.className} fade-in`}>
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Icon />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || config.label}
        </div>
        <span className="nexus-node-badge">{config.badgeText}</span>
      </div>

      <div className="nexus-node-body">
        <div className="node-controls">
          <div className="node-control-group">
            <div className="node-control-label">Tone</div>
            <input
              type="range"
              className="node-slider nodrag"
              min="0"
              max="100"
              value={tone}
              onChange={(e) => updateData({ tone: Number(e.target.value) })}
            />
            <div className="node-slider-labels">
              <span>Corporate</span>
              <span>Casual</span>
            </div>
          </div>
          <div className="node-control-group">
            <div className="node-control-label">Length</div>
            <select
              className="node-select nodrag"
              value={length}
              onChange={(e) => updateData({ length: e.target.value })}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        <div className="node-output nowheel">
          {output ? (
            <span>{output}</span>
          ) : (
            <div className="node-output-empty">
              Click "Generate" to create {platform} content
            </div>
          )}
        </div>

        {output && (
          <div className="node-char-count">
            <span>Characters</span>
            <span className={charClass}>
              {charCount} / {config.charLimit}
            </span>
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
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate
            </>
          )}
        </button>
        <button
          className="node-btn node-btn-copy nodrag"
          onClick={() => copy(output)}
          disabled={!output}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <Handle type="target" position={Position.Left} id="target" />
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
}

export default memo(PlatformNode);
