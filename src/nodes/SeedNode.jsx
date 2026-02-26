import { useState, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { FileText, Link, Loader2 } from "lucide-react";
import { scrapeUrl } from "../api";

export default function SeedNode({ data, id }) {
  const [text, setText] = useState(data.text || "");
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  const handleTextChange = useCallback(
    (e) => {
      const val = e.target.value;
      setText(val);
      if (data.onTextChange) data.onTextChange(id, val);
    },
    [id, data],
  );

  const handleScrape = useCallback(async () => {
    if (!url.trim()) return;
    setScraping(true);
    try {
      const result = await scrapeUrl(url);
      const newText = `[Source: ${result.title}]\n\n${result.text}`;
      setText(newText);
      if (data.onTextChange) data.onTextChange(id, newText);
    } catch (err) {
      console.error("Scrape failed:", err);
    } finally {
      setScraping(false);
    }
  }, [url, id, data]);

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
          className="seed-textarea"
          placeholder="Paste your content here... blog post, article, video transcript, or any text you want to transform."
          value={text}
          onChange={handleTextChange}
          rows={5}
        />
        <div className="seed-url-row">
          <input
            className="seed-url-input"
            type="url"
            placeholder="Or paste a URL to scrape..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="node-btn node-btn-generate"
            onClick={handleScrape}
            disabled={scraping || !url.trim()}
            style={{ flex: "none", padding: "8px 12px" }}
          >
            {scraping ? (
              <Loader2
                className="spinner"
                style={{ animation: "spin 0.6s linear infinite" }}
              />
            ) : (
              <Link size={14} />
            )}
          </button>
        </div>
        <div className="seed-word-count">{wordCount} words</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
