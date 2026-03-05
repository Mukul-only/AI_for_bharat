// ── ScheduleNode — AI content calendar ──

import { useState, useCallback, memo } from "react";
import { Handle, Position } from "reactflow";
import { Calendar, Download, Sparkles } from "lucide-react";
import { generateSchedule } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";

const PLATFORM_COLORS = {
  Twitter: "#1da1f2",
  LinkedIn: "#0a66c2",
  Instagram: "#e1306c",
  Blog: "#10b981",
};

function ScheduleNode({ data, id }) {
  const [scheduleData, setScheduleData] = useState(data.scheduleData || null);
  const [loading, setLoading] = useState(false);

  const findSourceText = useNodeSource(id);

  const handleGenerate = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      showError("Connect a content node first!");
      return;
    }
    setLoading(true);
    try {
      const result = await generateSchedule(text);
      setScheduleData(result);
      showSuccess("Schedule generated!");
    } catch (err) {
      if (err.name !== "AbortError") {
        showError(`Schedule failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [findSourceText]);

  const handleExport = useCallback(() => {
    if (!scheduleData) return;
    const csv = [
      "Date,Day,Time,Platform,Type,Status",
      ...scheduleData.schedule.map(
        (s) =>
          `${s.date},${s.day},${s.time},${s.platform},${s.type},${s.status}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusflow-schedule-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Schedule exported as CSV!", { accent: "emerald" });
  }, [scheduleData]);

  return (
    <div className="nexus-node schedule-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Calendar />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Content Calendar"}
        </div>
        <span className="nexus-node-badge">PLANNER</span>
      </div>

      <div className="nexus-node-body">
        {scheduleData ? (
          <div className="schedule-content nowheel">
            <div className="schedule-list">
              {scheduleData.schedule.map((item, i) => (
                <div key={i} className="schedule-item">
                  <div className="schedule-date">
                    <span className="schedule-day">{item.day}</span>
                    <span className="schedule-date-text">{item.date}</span>
                  </div>
                  <div className="schedule-details">
                    <span
                      className="schedule-platform"
                      style={{
                        color: PLATFORM_COLORS[item.platform] || "#8b5cf6",
                      }}
                    >
                      {item.platform}
                    </span>
                    <span className="schedule-type">{item.type}</span>
                  </div>
                  <div className="schedule-time">{item.time}</div>
                  <div
                    className={`schedule-status schedule-status-${item.status}`}
                  >
                    {item.status === "ready" ? "🟢" : "🔵"}
                  </div>
                </div>
              ))}
            </div>

            <div className="schedule-best-times">
              <div className="node-control-label" style={{ marginBottom: 6 }}>
                Optimal Post Times
              </div>
              {Object.entries(scheduleData.bestTimes).map(
                ([platform, time]) => (
                  <div key={platform} className="schedule-best-time-row">
                    <span
                      style={{
                        color: PLATFORM_COLORS[platform],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      {platform}
                    </span>
                    <span
                      style={{ color: "var(--text-secondary)", fontSize: 11 }}
                    >
                      {time}
                    </span>
                  </div>
                ),
              )}
            </div>

            <div className="schedule-recommendation">
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                💡 {scheduleData.recommendation}
              </span>
            </div>
          </div>
        ) : (
          <div className="node-output-empty" style={{ padding: "24px 0" }}>
            Connect a content node to generate an AI-optimized posting schedule
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
              Planning...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Schedule
            </>
          )}
        </button>
        {scheduleData && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={handleExport}
          >
            <Download size={14} />
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}

export default memo(ScheduleNode);
