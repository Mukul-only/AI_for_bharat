import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { AlignLeft, Sparkles, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

const SUMMARY_FORMATS = [
  { value: "oneliner", label: "1-Line" },
  { value: "paragraph", label: "Paragraph" },
  { value: "bullets", label: "Bullet Points" },
];

async function mockSummarize(text, format) {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));

  const core = text.slice(0, 60).replace(/\n/g, " ");

  if (format === "oneliner") {
    return `${core}... — a framework for transforming AI-driven content workflows into scalable digital strategies.`;
  }
  if (format === "bullets") {
    return `Key Takeaways:\n\n• AI-powered workflows transform one idea into multi-platform content\n• Content repurposing saves 75% of creation time\n• Platform-native formatting increases engagement by 3-4x\n• Automated scheduling ensures consistent publishing cadence\n• Data-driven optimization through viral scoring and sentiment analysis`;
  }
  return `${core}... This approach leverages AI to transform a single piece of seed content into platform-optimized formats across Twitter, LinkedIn, Instagram, and blog channels. By combining automated generation with engagement scoring and SEO tagging, content creators can achieve significantly higher output while maintaining quality and brand consistency.`;
}

export default function SummarizeNode({ data, id }) {
  const [format, setFormat] = useState(data.format || "paragraph");
  const [output, setOutput] = useState(data.output || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { getEdges, getNode } = useReactFlow();

  const findSourceText = useCallback(() => {
    const edges = getEdges();
    const incomingEdges = edges.filter((e) => e.target === id);
    for (const edge of incomingEdges) {
      const sourceNode = getNode(edge.source);
      if (!sourceNode) continue;
      const text = sourceNode.data?.output || sourceNode.data?.text;
      if (text && text.trim()) return text;
    }
    return null;
  }, [id, getEdges, getNode]);

  const handleSummarize = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      toast.error("Connect a content node first!", { style: toastStyle });
      return;
    }
    setLoading(true);
    try {
      const result = await mockSummarize(text, format);
      setOutput(result);
      toast.success("Summary generated!", {
        style: toastStyle,
        iconTheme: { primary: "#6366f1", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Summarization failed: ${err.message}`, {
        style: toastStyle,
      });
    } finally {
      setLoading(false);
    }
  }, [findSourceText, format]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied!", { style: toastStyle, duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="nexus-node summarize-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <AlignLeft />
        </div>
        <div className="nexus-node-title">Summarizer</div>
        <span className="nexus-node-badge">AI</span>
      </div>

      <div className="nexus-node-body">
        <div className="node-control-label" style={{ marginBottom: 6 }}>
          Format
        </div>
        <div className="summary-format-row">
          {SUMMARY_FORMATS.map((f) => (
            <button
              key={f.value}
              className={`summary-format-btn nodrag ${format === f.value ? "active" : ""}`}
              onClick={() => setFormat(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="node-output nowheel" style={{ marginTop: 10 }}>
          {output ? (
            <span style={{ whiteSpace: "pre-wrap" }}>{output}</span>
          ) : (
            <div className="node-output-empty">
              Connect a content node and click Summarize
            </div>
          )}
        </div>
      </div>

      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-generate nodrag"
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Summarize
            </>
          )}
        </button>
        {output && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
}
