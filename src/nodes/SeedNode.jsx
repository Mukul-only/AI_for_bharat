import { useCallback, useEffect, useRef } from "react";
import { Handle, Position } from "reactflow";
import { FileText, Link, Loader2 } from "lucide-react";
import { scrapeUrl } from "../api";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

export default function SeedNode({ data, id }) {
  // Use data.text as the single source of truth (managed by parent App)
  const text = data.text || "";
  const scraping = data._scraping || false;
  const textareaRef = useRef(null);

  const handleTextChange = useCallback(
    (e) => {
      const val = e.target.value;
      if (data.onUpdate) data.onUpdate(id, { text: val });
    },
    [id, data.onUpdate],
  );

  const handleUrlChange = useCallback(
    (e) => {
      if (data.onUpdate) data.onUpdate(id, { _urlInput: e.target.value });
    },
    [id, data.onUpdate],
  );

  const handleScrape = useCallback(async () => {
    const url = (data._urlInput || "").trim();
    if (!url) return;
    if (data.onUpdate) data.onUpdate(id, { _scraping: true });
    try {
      const result = await scrapeUrl(url);
      const newText = `[Source: ${result.title}]\n\n${result.text}`;
      if (data.onUpdate)
        data.onUpdate(id, { text: newText, _scraping: false, _urlInput: "" });
      toast.success(`Scraped: ${result.wordCount} words`, {
        style: toastStyle,
      });
    } catch (err) {
      toast.error(`Scrape failed: ${err.message}`, { style: toastStyle });
      if (data.onUpdate) data.onUpdate(id, { _scraping: false });
    }
  }, [id, data.onUpdate, data._urlInput]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="nexus-node seed-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <FileText />
        </div>
        <div className="nexus-node-title">Seed Content</div>
        <span className="nexus-node-badge">INPUT</span>
      </div>
      <div className="nexus-node-body">
        <textarea
          ref={textareaRef}
          className="seed-textarea nodrag nowheel"
          placeholder="Paste your content here... blog post, article, video transcript, or any text you want to transform."
          value={text}
          onChange={handleTextChange}
          rows={5}
        />
        <div className="seed-url-row">
          <input
            className="seed-url-input nodrag"
            type="url"
            placeholder="Or paste a URL to scrape..."
            value={data._urlInput || ""}
            onChange={handleUrlChange}
          />
          <button
            className="node-btn node-btn-generate nodrag"
            onClick={handleScrape}
            disabled={scraping || !(data._urlInput || "").trim()}
            style={{ flex: "none", padding: "8px 12px" }}
          >
            {scraping ? <div className="spinner"></div> : <Link size={14} />}
          </button>
        </div>
        <div className="seed-word-count">{wordCount} words</div>
      </div>
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
}
