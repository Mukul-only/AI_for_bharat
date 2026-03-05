// ── SummarizeNode — Content summarization ──

import { useState, useCallback, memo } from "react";
import { Handle, Position } from "reactflow";
import { AlignLeft, Sparkles, Copy, Check } from "lucide-react";
import { summarizeContent } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";
import useClipboard from "../hooks/useClipboard";

const SUMMARY_FORMATS = [
  { value: "oneliner", label: "1-Line" },
  { value: "paragraph", label: "Paragraph" },
  { value: "bullets", label: "Bullet Points" },
];

function SummarizeNode({ data, id }) {
  const [format, setFormat] = useState(data.format || "paragraph");
  const [output, setOutput] = useState(data.output || "");
  const [loading, setLoading] = useState(false);

  const findSourceText = useNodeSource(id);
  const { copy, copied } = useClipboard();

  const handleSummarize = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      showError("Connect a content node first!");
      return;
    }
    setLoading(true);
    try {
      const result = await summarizeContent(text, format);
      setOutput(result.summary);
      showSuccess("Summary generated!", { accent: "indigo" });
    } catch (err) {
      if (err.name !== "AbortError") {
        showError(`Summarization failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [findSourceText, format]);

  return (
    <div className="nexus-node summarize-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <AlignLeft />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Summarizer"}
        </div>
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
            onClick={() => copy(output)}
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

export default memo(SummarizeNode);
