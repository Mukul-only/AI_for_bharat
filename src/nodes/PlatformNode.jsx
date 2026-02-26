import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import {
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { generateContent } from "../api";

const PLATFORM_CONFIG = {
  twitter: {
    icon: Twitter,
    label: "Twitter / X Thread",
    className: "twitter-node",
    charLimit: 2800,
    badgeText: "SOCIAL",
    charLimitLabel: "10 tweets × 280",
  },
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn Post",
    className: "linkedin-node",
    charLimit: 3000,
    badgeText: "PROFESSIONAL",
    charLimitLabel: "3,000 chars",
  },
  instagram: {
    icon: Instagram,
    label: "Instagram Caption",
    className: "instagram-node",
    charLimit: 2200,
    badgeText: "VISUAL",
    charLimitLabel: "2,200 chars",
  },
  blog: {
    icon: BookOpen,
    label: "Blog Article",
    className: "blog-node",
    charLimit: 15000,
    badgeText: "LONG-FORM",
    charLimitLabel: "~2,000 words",
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

  const findSeedText = useCallback(() => {
    const edges = getEdges();
    const incomingEdge = edges.find((e) => e.target === id);
    if (!incomingEdge) return null;
    const sourceNode = getNode(incomingEdge.source);
    if (!sourceNode) return null;
    return sourceNode.data?.text || null;
  }, [id, getEdges, getNode]);

  const handleGenerate = useCallback(async () => {
    const seedText = findSeedText();
    if (!seedText) {
      setOutput(
        "⚠️ Connect a Seed Node first! Drag an edge from a Seed Node to this node.",
      );
      return;
    }
    setLoading(true);
    try {
      const result = await generateContent(seedText, platform, tone, length);
      setOutput(result.generatedText);
      if (data.onOutputChange) data.onOutputChange(id, result.generatedText);
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [findSeedText, platform, tone, length, id, data]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
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
              className="node-slider"
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
              className="node-select"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        <div className="node-output">
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
          className="node-btn node-btn-generate"
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
          className="node-btn node-btn-copy"
          onClick={handleCopy}
          disabled={!output}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
