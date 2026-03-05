import { useState } from "react";
import {
  Lock,
  Link2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/* ─── Tokens (CSS‑var‑aware) ──── */
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const DIVIDER = "var(--pf-divider, rgba(255,255,255,0.06))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

interface Props {
  isGoogleSignIn: boolean;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onPasswordUpdate?: (newPasswordHash: string) => void;
}

/* ── Modal backdrop ── */
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#161616",
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 380,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          fontFamily: FONT,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PasswordModal({
  onClose,
  onPasswordUpdate,
}: {
  onClose: () => void;
  onPasswordUpdate?: (hash: string) => void;
}) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });
  const [saved, setSaved] = useState(false);

  const toggleShow = (f: "current" | "newPass" | "confirm") =>
    setShow((p) => ({ ...p, [f]: !p[f] }));

  const handleSave = () => {
    if (form.newPass && form.newPass === form.confirm) {
      // Persist the password (in real app this would be hashed and sent to API)
      if (onPasswordUpdate) {
        // Simple hash for demo: btoa encoding
        onPasswordUpdate(btoa(form.newPass));
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    }
  };

  const isValid =
    form.current && form.newPass.length >= 8 && form.newPass === form.confirm;

  return (
    <Backdrop>
      {saved ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "16px 0",
          }}
        >
          <CheckCircle2 size={38} style={{ color: "#22c55e" }} />
          <p
            style={{
              color: TEXT_PRI,
              fontSize: 15,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Password updated!
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                padding: 9,
                borderRadius: 9,
                background: "rgba(255,255,255,0.07)",
                display: "flex",
              }}
            >
              <Lock size={15} style={{ color: TEXT_SEC }} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Change Password
              </h3>
              <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
                Use at least 8 characters
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(["current", "newPass", "confirm"] as const).map((f) => {
              const labels = {
                current: "Current Password",
                newPass: "New Password",
                confirm: "Confirm New Password",
              };
              return (
                <div key={f}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: TEXT_SEC,
                      marginBottom: 5,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {labels[f]}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={show[f] ? "text" : "password"}
                      placeholder="••••••••"
                      value={form[f]}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, [f]: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "9px 36px 9px 12px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${BORDER}`,
                        color: TEXT_PRI,
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: FONT,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(f)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: TEXT_SEC,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {show[f] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {form.newPass && form.confirm && form.newPass !== form.confirm && (
            <p style={{ fontSize: 11, color: "#f87171", marginTop: 8 }}>
              Passwords don't match
            </p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: "rgba(255,255,255,0.07)",
                color: TEXT_PRI,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: isValid ? "#fff" : "rgba(255,255,255,0.12)",
                color: isValid ? "#000" : TEXT_SEC,
                fontSize: 13,
                fontWeight: 500,
                cursor: isValid ? "pointer" : "not-allowed",
                fontFamily: FONT,
                transition: "background 0.15s",
              }}
            >
              Update Password
            </button>
          </div>
        </>
      )}
    </Backdrop>
  );
}

function DeleteModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmed, setConfirmed] = useState("");
  const ok = confirmed === "DELETE";
  return (
    <Backdrop>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: 9,
            borderRadius: 9,
            background: "rgba(239,68,68,0.12)",
            display: "flex",
          }}
        >
          <AlertTriangle size={15} style={{ color: "#f87171" }} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>
          Delete Account
        </h3>
      </div>
      <p
        style={{
          fontSize: 13,
          color: TEXT_SEC,
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        This action is{" "}
        <strong style={{ color: TEXT_PRI }}>permanent and irreversible</strong>.
        All your workflows, settings, and data will be permanently deleted.
      </p>
      <div
        style={{
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.18)",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 11, color: "#f87171", margin: "0 0 8px" }}>
          Type <strong>DELETE</strong> to confirm:
        </p>
        <input
          type="text"
          placeholder="DELETE"
          value={confirmed}
          onChange={(e) => setConfirmed(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 7,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BORDER}`,
            color: TEXT_PRI,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: FONT,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 9,
            border: "none",
            background: "rgba(255,255,255,0.07)",
            color: TEXT_PRI,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!ok}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 9,
            border: "none",
            background: ok ? "rgba(239,68,68,0.85)" : "rgba(239,68,68,0.18)",
            color: ok ? "#fff" : "#f87171",
            fontSize: 13,
            fontWeight: 500,
            cursor: ok ? "pointer" : "not-allowed",
            fontFamily: FONT,
          }}
        >
          Delete Account
        </button>
      </div>
    </Backdrop>
  );
}

/* ── Action row ── */
function ActionRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  variant = "default",
  onClick,
  badge,
  disabled,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  variant?: "default" | "destructive" | "success";
  onClick: () => void;
  badge?: React.ReactNode;
  disabled?: boolean;
}) {
  const btnStyles: Record<string, React.CSSProperties> = {
    default: { background: "rgba(255,255,255,0.07)", color: TEXT_PRI },
    destructive: { background: "rgba(239,68,68,0.1)", color: "#f87171" },
    success: { background: "rgba(34,197,94,0.1)", color: "#4ade80" },
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 22px",
        borderBottom: `1px solid ${DIVIDER}`,
        gap: 12,
      }}
      className="action-row-last"
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}
      >
        <div
          style={{
            padding: 9,
            borderRadius: 9,
            background: "rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <Icon size={14} style={{ color: TEXT_SEC, display: "block" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_PRI,
                margin: 0,
              }}
            >
              {title}
            </p>
            {badge}
          </div>
          <p style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          flexShrink: 0,
          padding: "6px 14px",
          borderRadius: 8,
          border: "none",
          fontSize: 12,
          fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: FONT,
          transition: "opacity 0.15s",
          opacity: disabled ? 0.4 : 1,
          ...btnStyles[variant],
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function AccountSecuritySection({
  isGoogleSignIn,
  onSignOut,
  onDeleteAccount,
  onPasswordUpdate,
}: Props) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      workflows: [
        { id: "wf_001", name: "YouTube Script Generator" },
        { id: "wf_002", name: "Instagram Caption Batch" },
      ],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-workflows-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  const Card = ({
    children,
    style = {},
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`.action-row-last:last-child { border-bottom: none !important; }`}</style>

      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Account &amp; Security
        </h2>
        <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 5 }}>
          Manage your account access, connected services, and data privacy
          settings.
        </p>
      </div>

      {/* Security actions */}
      <Card style={{ marginBottom: 8 }}>
        <ActionRow
          icon={Lock}
          title="Change Password"
          description={
            isGoogleSignIn
              ? "Not available for Google sign-in accounts"
              : "Update your account password"
          }
          actionLabel="Change"
          onClick={() => setShowPasswordModal(true)}
          disabled={isGoogleSignIn}
        />
        <ActionRow
          icon={Link2}
          title="Connected Accounts"
          description={
            isGoogleSignIn
              ? "Google account is linked"
              : "No external accounts linked"
          }
          actionLabel={isGoogleSignIn ? "Manage" : "Connect"}
          onClick={() => {}}
          badge={
            isGoogleSignIn ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(66,133,244,0.12)",
                  color: "#93c5fd",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </span>
            ) : undefined
          }
        />
      </Card>

      {/* Export */}
      <Card style={{ marginBottom: 8 }}>
        <ActionRow
          icon={Download}
          title="Export Data"
          description="Download all your workflows as a JSON file"
          actionLabel={exportDone ? "Downloaded!" : "Export"}
          variant={exportDone ? "success" : "default"}
          onClick={handleExport}
        />
      </Card>

      {/* Danger zone */}
      <div
        style={{
          background: SURFACE,
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: "12px 22px", borderBottom: `1px solid ${DIVIDER}` }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            Danger Zone
          </p>
        </div>
        <ActionRow
          icon={Trash2}
          title="Delete Account"
          description="Permanently remove your account and all associated data"
          actionLabel="Delete"
          variant="destructive"
          onClick={() => setShowDeleteModal(true)}
        />
      </div>

      {/* Footer hint */}
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          textAlign: "center",
          marginTop: 24,
        }}
      >
        To sign out, use the{" "}
        <strong style={{ color: TEXT_SEC }}>Sign Out</strong> button in the top
        navigation bar.
      </p>

      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onPasswordUpdate={onPasswordUpdate}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDeleteAccount();
          }}
        />
      )}
    </div>
  );
}
