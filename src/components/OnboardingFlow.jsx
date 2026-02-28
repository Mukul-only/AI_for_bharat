import { useState } from "react";
import {
  Utensils,
  Cpu,
  Shirt,
  GraduationCap,
  Dumbbell,
  Plane,
  DollarSign,
  MoreHorizontal,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  BookOpen,
  Users,
  Briefcase,
  Globe,
  Palette,
  Building2,
  Laugh,
  Shield,
  Coffee,
  Flame,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
} from "lucide-react";

const STEPS = [
  {
    id: "niche",
    title: "What's your niche?",
    subtitle: "Choose the area you create content about",
    multiSelect: false,
    options: [
      { value: "food", label: "Food", icon: Utensils, color: "#f59e0b" },
      { value: "tech", label: "Tech", icon: Cpu, color: "#3b82f6" },
      { value: "fashion", label: "Fashion", icon: Shirt, color: "#ec4899" },
      {
        value: "college",
        label: "College Life",
        icon: GraduationCap,
        color: "#8b5cf6",
      },
      { value: "fitness", label: "Fitness", icon: Dumbbell, color: "#10b981" },
      { value: "travel", label: "Travel", icon: Plane, color: "#06b6d4" },
      {
        value: "finance",
        label: "Finance",
        icon: DollarSign,
        color: "#f43f5e",
      },
      {
        value: "other",
        label: "Other",
        icon: MoreHorizontal,
        color: "#9090b0",
      },
    ],
  },
  {
    id: "platforms",
    title: "What platforms do you use?",
    subtitle: "Select all that apply — we'll tailor your content nodes",
    multiSelect: true,
    options: [
      {
        value: "instagram",
        label: "Instagram",
        icon: Instagram,
        color: "#e1306c",
      },
      {
        value: "linkedin",
        label: "LinkedIn",
        icon: Linkedin,
        color: "#0a66c2",
      },
      {
        value: "twitter",
        label: "Twitter / X",
        icon: Twitter,
        color: "#1da1f2",
      },
      { value: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000" },
      { value: "blog", label: "Blog", icon: BookOpen, color: "#10b981" },
    ],
  },
  {
    id: "audience",
    title: "Who is your audience?",
    subtitle: "This helps us set the right tone and language",
    multiSelect: false,
    options: [
      {
        value: "students",
        label: "Students",
        icon: GraduationCap,
        color: "#8b5cf6",
      },
      {
        value: "professionals",
        label: "Professionals",
        icon: Briefcase,
        color: "#3b82f6",
      },
      { value: "general", label: "General", icon: Globe, color: "#10b981" },
      { value: "creators", label: "Creators", icon: Palette, color: "#f59e0b" },
      {
        value: "business",
        label: "Business Owners",
        icon: Building2,
        color: "#f43f5e",
      },
    ],
  },
  {
    id: "tone",
    title: "What's your tone?",
    subtitle: "Choose a voice that represents your brand",
    multiSelect: false,
    options: [
      { value: "funny", label: "Funny", icon: Laugh, color: "#f59e0b" },
      {
        value: "professional",
        label: "Professional",
        icon: Shield,
        color: "#3b82f6",
      },
      { value: "casual", label: "Casual", icon: Coffee, color: "#10b981" },
      {
        value: "motivational",
        label: "Motivational",
        icon: Flame,
        color: "#f43f5e",
      },
      { value: "bold", label: "Bold", icon: Zap, color: "#8b5cf6" },
    ],
  },
];

export default function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    niche: null,
    platforms: [],
    audience: null,
    tone: null,
  });
  const [direction, setDirection] = useState("forward");
  const [showSummary, setShowSummary] = useState(false);

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;

  const handleSelect = (value) => {
    const stepId = step.id;
    if (step.multiSelect) {
      setAnswers((prev) => {
        const arr = prev[stepId] || [];
        return {
          ...prev,
          [stepId]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [stepId]: value }));
    }
  };

  const isSelected = (value) => {
    const ans = answers[step.id];
    if (step.multiSelect) return (ans || []).includes(value);
    return ans === value;
  };

  const canProceed = () => {
    const ans = answers[step.id];
    if (step.multiSelect) return ans && ans.length > 0;
    return ans !== null;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    setDirection("forward");
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setDirection("backward");
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleFinish = () => {
    onComplete(answers);
  };

  // Summary labels
  const getLabel = (stepId, value) => {
    const s = STEPS.find((st) => st.id === stepId);
    const opt = s?.options.find((o) => o.value === value);
    return opt?.label || value;
  };

  if (showSummary) {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card onboarding-slide-in">
          <div className="onboarding-summary">
            <div className="onboarding-summary-icon">
              <Sparkles size={40} />
            </div>
            <h2 className="onboarding-summary-title">You're all set!</h2>
            <p className="onboarding-summary-subtitle">
              Here's your creator profile — we'll use this to personalize your
              content.
            </p>

            <div className="onboarding-summary-grid">
              <div className="onboarding-summary-item">
                <span className="onboarding-summary-label">Niche</span>
                <span className="onboarding-summary-value">
                  {getLabel("niche", answers.niche)}
                </span>
              </div>
              <div className="onboarding-summary-item">
                <span className="onboarding-summary-label">Platforms</span>
                <span className="onboarding-summary-value">
                  {answers.platforms
                    .map((p) => getLabel("platforms", p))
                    .join(", ")}
                </span>
              </div>
              <div className="onboarding-summary-item">
                <span className="onboarding-summary-label">Audience</span>
                <span className="onboarding-summary-value">
                  {getLabel("audience", answers.audience)}
                </span>
              </div>
              <div className="onboarding-summary-item">
                <span className="onboarding-summary-label">Tone</span>
                <span className="onboarding-summary-value">
                  {getLabel("tone", answers.tone)}
                </span>
              </div>
            </div>

            <div className="onboarding-nav">
              <button className="onboarding-btn-back" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back
              </button>
              <button className="onboarding-btn-finish" onClick={handleFinish}>
                <Rocket size={16} />
                Launch NexusFlow
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Progress */}
        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-progress-step ${i <= currentStep ? "active" : ""} ${i < currentStep ? "completed" : ""}`}
            >
              <div className="onboarding-progress-dot">
                {i < currentStep ? <Check size={12} /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`onboarding-progress-line ${i < currentStep ? "filled" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div
          className={`onboarding-step-content onboarding-slide-${direction}`}
          key={currentStep}
        >
          <h2 className="onboarding-step-title">{step.title}</h2>
          <p className="onboarding-step-subtitle">{step.subtitle}</p>

          <div
            className={`onboarding-options ${step.options.length <= 5 ? "compact" : ""}`}
          >
            {step.options.map((opt) => {
              const Icon = opt.icon;
              const selected = isSelected(opt.value);
              return (
                <button
                  key={opt.value}
                  className={`onboarding-option ${selected ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    "--opt-color": opt.color,
                    "--opt-color-dim": `${opt.color}22`,
                    "--opt-color-glow": `${opt.color}40`,
                  }}
                >
                  <div className="onboarding-option-icon">
                    <Icon size={22} />
                  </div>
                  <span className="onboarding-option-label">{opt.label}</span>
                  {selected && (
                    <div className="onboarding-option-check">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="onboarding-nav">
          {currentStep > 0 ? (
            <button className="onboarding-btn-back" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            className={`onboarding-btn-next ${!canProceed() ? "disabled" : ""}`}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === totalSteps - 1 ? "Review" : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
