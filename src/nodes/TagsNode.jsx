import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Tags, Sparkles, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

// Mock tag generation (in production, uses Claude 3 Haiku)
async function generateTags(text) {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));

  const words = text.toLowerCase().split(/\s+/);
  const topics = [
    "AI",
    "ContentCreation",
    "Marketing",
    "DigitalStrategy",
    "Automation",
    "SocialMedia",
    "Growth",
    "Innovation",
    "Tech",
    "CreatorEconomy",
    "Branding",
    "ContentMarketing",
    "Productivity",
    "FutureOfWork",
    "StartupLife",
  ];

  // Pick relevant-looking tags based on seed text
  const selectedHashtags = topics
    .sort(() => Math.random() - 0.5)
    .slice(0, 8 + Math.floor(Math.random() * 5))
    .map((t) => `#${t}`);

  const categories = [
    "Technology",
    "Marketing",
    "Business Strategy",
    "Social Media",
    "Content Creation",
  ];
  const selectedCategories = categories
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const seoKeywords = [
    "content creation tips",
    "AI marketing tools",
    "social media strategy",
    "content repurposing",
    "digital content workflow",
    "content automation",
    "engagement optimization",
  ];
  const selectedKeywords = seoKeywords
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return {
    hashtags: selectedHashtags,
    categories: selectedCategories,
    keywords: selectedKeywords,
    readingLevel: ["Beginner", "Intermediate", "Advanced"][
      Math.floor(Math.random() * 3)
    ],
    estimatedReadTime: `${2 + Math.floor(Math.random() * 8)} min read`,
  };
}

export default function TagsNode({ data, id }) {
  const [tagData, setTagData] = useState(data.tagData || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const result = await generateTags(text);
      setTagData(result);
      toast.success("Tags generated!", {
        style: toastStyle,
        iconTheme: { primary: "#06b6d4", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Tag generation failed: ${err.message}`, {
        style: toastStyle,
      });
    } finally {
      setLoading(false);
    }
  }, [findSourceText]);

  const handleCopyHashtags = useCallback(() => {
    if (!tagData) return;
    navigator.clipboard.writeText(tagData.hashtags.join(" "));
    setCopied(true);
    toast.success("Hashtags copied!", { style: toastStyle, duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  }, [tagData]);

  return (
    <div className="nexus-node tags-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Tags />
        </div>
        <div className="nexus-node-title">Smart Tags</div>
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
            onClick={handleCopyHashtags}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}
