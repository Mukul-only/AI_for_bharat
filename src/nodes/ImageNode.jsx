import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Image, Download, Sparkles } from "lucide-react";
import { generateImage } from "../api";
import toast from "react-hot-toast";

const toastStyle = {
  background: "#1a1a28",
  color: "#f0f0f5",
  border: "1px solid rgba(255,255,255,0.08)",
  fontSize: "13px",
};

const STYLES = [
  { value: "photorealistic", label: "📷 Photo" },
  { value: "illustration", label: "🎨 Illustration" },
  { value: "minimal", label: "⬜ Minimal" },
  { value: "abstract", label: "🌀 Abstract" },
];

export default function ImageNode({ data, id }) {
  const [style, setStyle] = useState(data.style || "photorealistic");
  const [imageUrl, setImageUrl] = useState(data.imageUrl || "");
  const [loading, setLoading] = useState(false);

  const { getEdges, getNode } = useReactFlow();

  const findSeedText = useCallback(() => {
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
    const seedText = findSeedText();
    if (!seedText) {
      toast.error(
        "Connect a content node first! Drag from Seed / Platform → this node.",
        { style: toastStyle },
      );
      return;
    }
    setLoading(true);
    try {
      const result = await generateImage(seedText, style);
      setImageUrl(result.imageUrl);
      if (data.onImageChange) data.onImageChange(id, result.imageUrl);
      toast.success("Image generated!", {
        style: toastStyle,
        iconTheme: { primary: "#f59e0b", secondary: "#f0f0f5" },
      });
    } catch (err) {
      toast.error(`Image generation failed: ${err.message}`, {
        style: toastStyle,
      });
    } finally {
      setLoading(false);
    }
  }, [findSeedText, style, id, data]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
  }, [imageUrl]);

  return (
    <div className="nexus-node image-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <Image />
        </div>
        <div className="nexus-node-title">Image Generator</div>
        <span className="nexus-node-badge">VISUAL</span>
      </div>

      <div className="nexus-node-body">
        <div className="node-control-label" style={{ marginBottom: 8 }}>
          Style
        </div>
        <div className="image-style-grid">
          {STYLES.map((s) => (
            <button
              key={s.value}
              className={`image-style-option nodrag ${style === s.value ? "active" : ""}`}
              onClick={() => setStyle(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="image-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="Generated content" />
          ) : (
            <div className="image-preview-empty">
              <Image />
              <span>Generate an image from your content</span>
            </div>
          )}
        </div>
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
              Creating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Image
            </>
          )}
        </button>
        {imageUrl && (
          <button
            className="node-btn node-btn-copy nodrag"
            onClick={handleDownload}
          >
            <Download size={14} />
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="target" />
    </div>
  );
}
