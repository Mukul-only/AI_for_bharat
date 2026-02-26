import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { TrendingUp, Loader2, Sparkles } from "lucide-react";
import { scoreContent } from "../api";

export default function ViralScoreNode({ data, id }) {
  const [scoreData, setScoreData] = useState(data.scoreData || null);
  const [loading, setLoading] = useState(false);

  const { getEdges, getNode } = useReactFlow();

  const findSourceText = useCallback(() => {
    const edges = getEdges();
    const incomingEdge = edges.find((e) => e.target === id);
    if (!incomingEdge) return null;
    const sourceNode = getNode(incomingEdge.source);
    if (!sourceNode) return null;
    return sourceNode.data?.output || sourceNode.data?.text || null;
  }, [id, getEdges, getNode]);

  const handleAnalyze = useCallback(async () => {
    const text = findSourceText();
    if (!text) return;
    setLoading(true);
    try {
      const result = await scoreContent(text);
      setScoreData(result);
    } catch (err) {
      console.error("Scoring failed:", err);
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
            <ul className="viral-suggestions">
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
          className="node-btn node-btn-generate"
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

      <Handle type="target" position={Position.Left} />
    </div>
  );
}
