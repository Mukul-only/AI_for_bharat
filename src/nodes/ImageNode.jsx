import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Image, Loader2, Download, Sparkles } from "lucide-react";
import { generateImage } from "../api";

const STYLES = [
  { value: "photorealistic", label: "📷 Photorealistic" },
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
    const incomingEdge = edges.find((e) => e.target === id);
    if (!incomingEdge) return null;
    const sourceNode = getNode(incomingEdge.source);
    if (!sourceNode) return null;
    // Check if source has output text (platform nodes) or text (seed nodes)
    return sourceNode.data?.output || sourceNode.data?.text || null;
  }, [id, getEdges, getNode]);

  const handleGenerate = useCallback(async () => {
    const seedText = findSeedText();
    if (!seedText) {
      return;
    }
    setLoading(true);
    try {
      const result = await generateImage(seedText, style);
      setImageUrl(result.imageUrl);
      if (data.onImageChange) data.onImageChange(id, result.imageUrl);
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [findSeedText, style, id, data]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `nexusflow-${style}-${Date.now()}.png`;
    link.click();
  }, [imageUrl, style]);

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
              className={`image-style-option ${style === s.value ? "active" : ""}`}
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
          className="node-btn node-btn-generate"
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
          <button className="node-btn node-btn-copy" onClick={handleDownload}>
            <Download size={14} />
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}
