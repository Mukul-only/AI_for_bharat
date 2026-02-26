import { Save, FolderOpen, HelpCircle } from "lucide-react";

export default function TopBar({
  workspaceName,
  onNameChange,
  nodeCount,
  edgeCount,
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

      <div className="top-bar-spacer"></div>

      <div className="top-bar-status">
        <span className="status-dot"></span>
        <span>
          {nodeCount} nodes · {edgeCount} edges
        </span>
      </div>

      <div className="top-bar-status" style={{ opacity: 0.5, fontSize: 11 }}>
        <span>Powered by Amazon Bedrock</span>
      </div>
    </div>
  );
}
