import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { TrendingUp, Sparkles } from "lucide-react";
import { scoreContent } from "../api";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

export default function ViralScoreNode({ data, id }) {
  const [scoreData, setScoreData] = useState(data.scoreData || null);
  const [loading, setLoading] = useState(false);

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

  const handleAnalyze = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      toast.error(
        "Connect a content node first! Drag from a Platform node → this node.",
        { style: toastStyle },
      );
      return;
    }
    setLoading(true);
    try {
      const result = await scoreContent(text);
      setScoreData(result);
      toast.success(`Viral score: ${result.score}/100`, {
        style: toastStyle,
        iconTheme: { primary: "#f43f5e", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Analysis failed: ${err.message}`, { style: toastStyle });
    } finally {
      setLoading(false);
    }
  }, [findSourceText]);

  const scorePct = scoreData ? `${scoreData.score}%` : "0%";

  return (
    <div className="nexus-node viral-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <TrendingUp />
        </div>
        <div className="nexus-node-title">Viral Check</div>
        <span className="nexus-node-badge">ANALYTICS</span>
      </div>

      <div className="nexus-node-body">
        {scoreData ? (
          <>
            <div className="viral-gauge">
              <div
                className="viral-score-circle"
                style={{ "--score-pct": scorePct }}
              >
                <div className="viral-score-inner">
                  <div className="viral-score-value">{scoreData.score}</div>
                  <div className="viral-score-label">Score</div>
                </div>
              </div>

              <div className="viral-sentiment">
                <div className="sentiment-tag sentiment-positive">
                  👍 {scoreData.sentiment.positive}%
                </div>
                <div className="sentiment-tag sentiment-neutral">
                  😐 {scoreData.sentiment.neutral}%
                </div>
                <div className="sentiment-tag sentiment-negative">
                  👎 {scoreData.sentiment.negative}%
                </div>
              </div>
            </div>

            <div
              className="node-control-label"
              style={{ marginTop: 8, marginBottom: 6 }}
            >
              Suggestions
            </div>
            <ul className="viral-suggestions nowheel">
              {scoreData.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="viral-gauge">
            <div className="viral-score-circle" style={{ "--score-pct": "0%" }}>
              <div className="viral-score-inner">
                <div className="viral-score-value" style={{ opacity: 0.2 }}>
                  ?
                </div>
                <div className="viral-score-label">Score</div>
              </div>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Connect a content node and click Analyze
            </p>
          </div>
        )}
      </div>

      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-generate nodrag"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analyze
            </>
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}
