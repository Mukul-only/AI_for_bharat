// ── SeedNode — Content input ──

import { useCallback, useRef, useMemo, memo } from "react";
import { Handle, Position } from "reactflow";
import { FileText, Zap } from "lucide-react";
import { debounce } from "../utils/helpers";

function SeedNode({ data, id }) {
  const text = data.text || "";
  const textareaRef = useRef(null);

  // Debounced text update — prevents state avalanche on every keystroke
  const debouncedUpdate = useMemo(
    () =>
      debounce((val) => {
        if (data.onUpdate) data.onUpdate(id, { text: val });
      }, 200),
    [id, data.onUpdate],
  );

  const handleTextChange = useCallback(
    (e) => {
      debouncedUpdate(e.target.value);
    },
    [debouncedUpdate],
  );

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="nexus-node seed-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <FileText />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Seed Content"}
        </div>
        <span className="nexus-node-badge">INPUT</span>
      </div>
      <div className="nexus-node-body">
        <textarea
          ref={textareaRef}
          className="seed-textarea nodrag nowheel"
          placeholder="Paste your content here... blog post, article, video transcript, or any text you want to transform."
          defaultValue={text}
          onChange={handleTextChange}
          rows={5}
        />
        <div className="seed-word-count">{wordCount} words</div>
      </div>
      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-repurpose nodrag"
          onClick={() => data.onRepurpose && data.onRepurpose(id, text)}
          disabled={!text.trim()}
          title="Auto-generate content for all platforms"
        >
          <Zap size={14} />
          Repurpose All
        </button>
      </div>
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
}

export default memo(SeedNode);
