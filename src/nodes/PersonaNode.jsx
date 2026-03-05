// ── PersonaNode — Audience persona definition for personalized content ──

import { useState, useCallback, memo } from "react";
import { Handle, Position } from "reactflow";
import { User, Sparkles } from "lucide-react";
import { showSuccess, showError } from "../utils/constants";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "genz", label: "Gen-Z" },
  { value: "academic", label: "Academic" },
  { value: "witty", label: "Witty" },
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];

function PersonaNode({ data, id }) {
  const [persona, setPersona] = useState(
    data.persona || {
      name: "",
      ageRange: "25-34",
      painPoints: "",
      tone: "professional",
      description: "",
    },
  );
  const [loading, setLoading] = useState(false);

  const updatePersona = useCallback(
    (updates) => {
      const next = { ...persona, ...updates };
      setPersona(next);
      if (data.onUpdate) data.onUpdate(id, { persona: next });
    },
    [persona, id, data.onUpdate],
  );

  const handleAutoGenerate = useCallback(async () => {
    const desc = persona.description?.trim();
    if (!desc) {
      showError(
        "Enter a short description first (e.g. 'tech startup founders')",
      );
      return;
    }
    setLoading(true);
    try {
      // Simulated AI persona generation (will use real API if connected)
      await new Promise((r) => setTimeout(r, 800));
      const generated = {
        ...persona,
        name: `${desc.split(" ").slice(0, 2).join(" ")} Persona`,
        painPoints: `Struggles with content consistency, limited time for social media, needs to reach ${desc} effectively, wants higher engagement rates`,
        tone: desc.toLowerCase().includes("student")
          ? "genz"
          : desc.toLowerCase().includes("executive")
            ? "professional"
            : "casual",
        ageRange: desc.toLowerCase().includes("student")
          ? "18-24"
          : desc.toLowerCase().includes("executive")
            ? "35-44"
            : "25-34",
      };
      setPersona(generated);
      if (data.onUpdate) data.onUpdate(id, { persona: generated });
      showSuccess("Persona generated!", { accent: "violet" });
    } catch {
      showError("Failed to generate persona");
    } finally {
      setLoading(false);
    }
  }, [persona, id, data.onUpdate]);

  return (
    <div className="nexus-node persona-node fade-in">
      <div className="nexus-node-header">
        <div className="nexus-node-icon">
          <User />
        </div>
        <div className="nexus-node-title">
          {data.labelOverride || "Audience Persona"}
        </div>
        <span className="nexus-node-badge">PERSONA</span>
      </div>

      <div className="nexus-node-body">
        {/* Description for AI generation */}
        <div className="node-control-label">Describe your audience</div>
        <input
          className="persona-input nodrag"
          type="text"
          placeholder='e.g. "tech startup founders"'
          value={persona.description}
          onChange={(e) => updatePersona({ description: e.target.value })}
        />

        {/* Name */}
        <div className="node-control-label" style={{ marginTop: 10 }}>
          Persona Name
        </div>
        <input
          className="persona-input nodrag"
          type="text"
          placeholder="e.g. Startup Steve"
          value={persona.name}
          onChange={(e) => updatePersona({ name: e.target.value })}
        />

        {/* Age + Tone row */}
        <div className="persona-row" style={{ marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="node-control-label">Age Range</div>
            <select
              className="persona-select nodrag"
              value={persona.ageRange}
              onChange={(e) => updatePersona({ ageRange: e.target.value })}
            >
              {AGE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div className="node-control-label">Tone</div>
            <select
              className="persona-select nodrag"
              value={persona.tone}
              onChange={(e) => updatePersona({ tone: e.target.value })}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pain Points */}
        <div className="node-control-label" style={{ marginTop: 10 }}>
          Pain Points
        </div>
        <textarea
          className="persona-textarea nodrag nowheel"
          placeholder="What problems does this audience face?"
          value={persona.painPoints}
          onChange={(e) => updatePersona({ painPoints: e.target.value })}
          rows={3}
        />
      </div>

      <div className="nexus-node-footer">
        <button
          className="node-btn node-btn-generate nodrag"
          onClick={handleAutoGenerate}
          disabled={loading || !persona.description?.trim()}
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
          }}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Auto-Generate
            </>
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} id="target" />
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
}

export default memo(PersonaNode);
