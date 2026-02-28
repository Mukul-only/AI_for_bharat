import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import {
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { generateContent } from "../api";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

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
};

export default function PlatformNode({ data, id }) {
  const platform = data.platform || "twitter";
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  const [tone, setTone] = useState(data.tone || 50);
  const [length, setLength] = useState(data.length || "medium");
  const [output, setOutput] = useState(data.output || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { getEdges, getNode } = useReactFlow();

  // Walk backward through edges to find any text source
  const findSeedText = useCallback(() => {
    const edges = getEdges();
    const incomingEdges = edges.filter((e) => e.target === id);
    if (incomingEdges.length === 0) return null;

    for (const edge of incomingEdges) {
      const sourceNode = getNode(edge.source);
      if (!sourceNode) continue;
      // Seed nodes have 'text', platform nodes have 'output'
      const text = sourceNode.data?.text || sourceNode.data?.output;
      if (text && text.trim()) return text;
    }
    return null;
  }, [id, getEdges, getNode]);

  const handleGenerate = useCallback(async () => {
    const seedText = findSeedText();
    if (!seedText) {
      toast.error("Connect a Seed Node first! Drag from Seed → this node.", {
        style: toastStyle,
      });
      return;
    }
    setLoading(true);
    try {
      const result = await generateContent(seedText, platform, tone, length);
      setOutput(result.generatedText);
      if (data.onOutputChange) data.onOutputChange(id, result.generatedText);
      toast.success(`${config.label} generated!`, {
        style: toastStyle,
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
      });
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
      toast.error(`Generation failed: ${err.message}`, { style: toastStyle });
    } finally {
      setLoading(false);
    }
  }, [findSeedText, platform, tone, length, id, data, config.label]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!", {
      style: toastStyle,
      duration: 1500,
    });
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

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
        <div className="nexus-node-title">{config.label}</div>
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
              onChange={(e) => setTone(Number(e.target.value))}
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
              onChange={(e) => setLength(e.target.value)}
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
          onClick={handleCopy}
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
