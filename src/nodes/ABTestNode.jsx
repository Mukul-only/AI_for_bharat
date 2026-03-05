// ── ABTestNode — Generate content variants for A/B testing ──

import { useState, useCallback, memo } from "react";
import { Handle, Position } from "reactflow";
import { GitBranch, Sparkles, Check, Copy } from "lucide-react";
import { generateVariants } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";

function ABTestNode({ data, id }) {
  const [variants, setVariants] = useState(data.variants || []);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const findSourceText = useNodeSource(id);

  const handleGenerate = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      showError(
        "Connect a content node first! Drag from a Platform node → this node.",
      );
      return;
    }
    setLoading(true);
    try {
      const result = await generateVariants(text);
      setVariants(result.variants);
      setActiveTab(0);
      showSuccess(`Generated ${result.variants.length} variants!`, {
        accent: "cyan",
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        showError(`Variant generation failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [findSourceText]);

  const handleCopy = useCallback(
    (idx) => {
      const text = variants[idx]?.text;
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      showSuccess("Copied to clipboard!");
      setTimeout(() => setCopiedIdx(-1), 2000);
    },
    [variants],
  );

  const LABELS = ["A", "B", "C"];

  return (
    <div className="nexus-node abtest-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <GitBranch />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "A/B Variants"}
        </div>
        <span className="nexus-node-badge">OPTIMIZE</span>
      </div>

      <div className="nexus-node-body">
        {variants.length > 0 ? (
          <>
            {/* Tab bar */}
            <div className="abtest-tabs">
              {variants.map((v, i) => (
                <button
                  key={i}
                  className={`abtest-tab nodrag ${i === activeTab ? "abtest-tab-active" : ""}`}
                  onClick={() => setActiveTab(i)}
                >
                  <span className="abtest-tab-label">
                    Variant {LABELS[i] || i + 1}
                  </span>
                  <span className="abtest-tab-score">{v.score}/100</span>
                </button>
              ))}
            </div>

            {/* Active variant content */}
            {variants[activeTab] && (
              <div className="abtest-content">
                <div className="abtest-approach">
                  <span className="abtest-approach-label">Approach:</span>
                  {variants[activeTab].approach}
                </div>
                <div className="abtest-text nowheel">
                  {variants[activeTab].text}
                </div>
                <div className="abtest-meta">
                  <span className="abtest-char-count">
                    {variants[activeTab].text.length} chars
                  </span>
                  <div className="abtest-score-bar">
                    <div
                      className="abtest-score-fill"
                      style={{
                        width: `${variants[activeTab].score}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className="node-output-empty"
            style={{ padding: "24px 0", textAlign: "center" }}
          >
            Connect a content node and click Generate to create A/B variants for
            comparison
          </div>
        )}
      </div>

      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-generate nodrag"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          }}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Variants
            </>
          )}
        </button>
        {variants.length > 0 && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={() => handleCopy(activeTab)}
          >
            {copiedIdx === activeTab ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}

export default memo(ABTestNode);
