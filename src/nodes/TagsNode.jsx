// ── TagsNode — Smart hashtags, categories & SEO keywords ──

import { useState, useCallback, memo } from "react";
import { Handle, Position } from "reactflow";
import { Tags, Sparkles, Copy, Check } from "lucide-react";
import { generateTags } from "../api";
import { showSuccess, showError } from "../utils/constants";
import useNodeSource from "../hooks/useNodeSource";
import useClipboard from "../hooks/useClipboard";

function TagsNode({ data, id }) {
  const [tagData, setTagData] = useState(data.tagData || null);
  const [loading, setLoading] = useState(false);

  const findSourceText = useNodeSource(id);
  const { copy, copied } = useClipboard({ successMessage: "Hashtags copied!" });

  const handleGenerate = useCallback(async () => {
    const text = findSourceText();
    if (!text) {
      showError("Connect a content node first!");
      return;
    }
    setLoading(true);
    try {
      const result = await generateTags(text);
      setTagData(result);
      showSuccess("Tags generated!", { accent: "cyan" });
    } catch (err) {
      if (err.name !== "AbortError") {
        showError(`Tag generation failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [findSourceText]);

  return (
    <div className="nexus-node tags-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Tags />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Smart Tags"}
        </div>
        <span className="nexus-node-badge">SEO</span>
      </div>

      <div className="nexus-node-body">
        {tagData ? (
          <div className="tags-content">
            <div className="tags-section">
              <div className="node-control-label">Hashtags</div>
              <div className="tags-cloud">
                {tagData.hashtags.map((tag, i) => (
                  <span key={i} className="tag-pill tag-hashtag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="tags-section">
              <div className="node-control-label">Categories</div>
              <div className="tags-cloud">
                {tagData.categories.map((cat, i) => (
                  <span key={i} className="tag-pill tag-category">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="tags-section">
              <div className="node-control-label">SEO Keywords</div>
              <div className="tags-cloud">
                {tagData.keywords.map((kw, i) => (
                  <span key={i} className="tag-pill tag-keyword">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="tags-meta">
              <div className="tags-meta-item">
                <span className="tags-meta-label">Reading Level</span>
                <span className="tags-meta-value">{tagData.readingLevel}</span>
              </div>
              <div className="tags-meta-item">
                <span className="tags-meta-label">Est. Read Time</span>
                <span className="tags-meta-value">
                  {tagData.estimatedReadTime}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="node-output-empty" style={{ padding: "24px 0" }}>
            Connect a content node to generate tags, hashtags, and SEO keywords
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
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Tags
            </>
          )}
        </button>
        {tagData && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={() => copy(tagData.hashtags.join(" "))}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}

export default memo(TagsNode);
