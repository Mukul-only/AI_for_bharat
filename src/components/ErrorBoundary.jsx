// ── ErrorBoundary — Per-node crash isolation ──

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Wraps individual nodes to isolate crashes.
 * If a node throws during render, shows a styled error card
 * instead of breaking the entire canvas.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[NexusFlow] Node crashed:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="nexus-node error-node fade-in"
          style={{ minWidth: 260 }}
        >
          <div
            className="nexus-node-header"
            style={{ borderBottom: "1px solid #3e1524" }}
          >
            <div
              className="nexus-node-icon"
              style={{ background: "#2c1119", color: "#f43f5e" }}
            >
              <AlertTriangle />
            </div>
            <div className="nexus-node-title">Node Error</div>
          </div>
          <div
            className="nexus-node-body"
            style={{ textAlign: "center", padding: "20px 16px" }}
          >
            <p style={{ color: "#f43f5e", fontSize: 12, marginBottom: 12 }}>
              This node encountered an error.
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 11,
                marginBottom: 16,
              }}
            >
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              className="node-btn node-btn-generate"
              onClick={this.handleRetry}
              style={{ margin: "0 auto" }}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
