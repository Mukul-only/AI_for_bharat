import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Calendar, Download, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

// Mock schedule generation
async function generateSchedule(text) {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

  const now = new Date();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const platforms = ["Twitter", "LinkedIn", "Instagram", "Blog"];
  const times = ["9:00 AM", "12:30 PM", "3:00 PM", "6:00 PM", "8:30 PM"];

  const schedule = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const postsPerDay = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < postsPerDay; j++) {
      schedule.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: days[date.getDay()],
        time: times[Math.floor(Math.random() * times.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        type: ["Post", "Thread", "Story", "Article"][
          Math.floor(Math.random() * 4)
        ],
        status: i === 0 ? "ready" : "scheduled",
      });
    }
  }
  return {
    schedule: schedule.slice(0, 10),
    bestTimes: {
      Twitter: "12:30 PM & 6:00 PM",
      LinkedIn: "9:00 AM & 3:00 PM",
      Instagram: "8:30 PM",
    },
    recommendation:
      "Post consistently at peak engagement times. Vary content types across platforms for maximum reach.",
  };
}

export default function ScheduleNode({ data, id }) {
  const [scheduleData, setScheduleData] = useState(data.scheduleData || null);
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

  const handleGenerate = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      toast.error("Connect a content node first!", { style: toastStyle });
      return;
    }
    setLoading(true);
    try {
      const result = await generateSchedule(text);
      setScheduleData(result);
      toast.success("Schedule generated!", {
        style: toastStyle,
        iconTheme: { primary: "#8b5cf6", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Schedule failed: ${err.message}`, { style: toastStyle });
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
    toast.success("Schedule exported as CSV!", { style: toastStyle });
  }, [scheduleData]);

  const platformColors = {
    Twitter: "#1da1f2",
    LinkedIn: "#0a66c2",
    Instagram: "#e1306c",
    Blog: "#10b981",
  };

  return (
    <div className="nexus-node schedule-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Calendar />
        </div>
        <div className="nexus-node-title">Content Calendar</div>
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
                        color: platformColors[item.platform] || "#8b5cf6",
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
                        color: platformColors[platform],
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
