import { Zap, Download, Keyboard } from "lucide-react";

export default function TopBar({
  workspaceName,
  onNameChange,
  nodeCount,
  edgeCount,
  onGenerateAll,
  onExportAll,
  onShowShortcuts,
  isGenerating,
}) {
  return (
    <div className="top-bar">
      <div className="top-bar-workspace">
        <input
          className="top-bar-workspace-name"
          value={workspaceName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Untitled Workspace"
        />
      </div>

      <div className="top-bar-actions">
        <button
          className="top-bar-btn top-bar-btn-primary"
          onClick={onGenerateAll}
          disabled={isGenerating}
          title="Generate content for all connected nodes (Ctrl+G)"
        >
          <Zap size={14} />
          {isGenerating ? "Generating..." : "Generate All"}
        </button>
        <button
          className="top-bar-btn"
          onClick={onExportAll}
          title="Export all content as JSON (Ctrl+E)"
        >
          <Download size={14} />
          Export All
        </button>
      </div>

      <div className="top-bar-spacer"></div>

      <div className="top-bar-status">
        <span className="status-dot"></span>
        <span>
          {nodeCount} nodes · {edgeCount} edges
        </span>
      </div>

      <button
        className="top-bar-btn top-bar-btn-help"
        onClick={onShowShortcuts}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={14} />
      </button>

      <div className="top-bar-status" style={{ opacity: 0.5, fontSize: 11 }}>
        <span>Powered by Amazon Bedrock</span>
      </div>
    </div>
  );
}
