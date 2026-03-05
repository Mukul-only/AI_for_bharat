import { useState, useRef } from "react";
import { Camera, Check, X, Pencil } from "lucide-react";
import { UserProfile } from "./types";

/* ─── Tokens (CSS‑var‑aware) ──── */
const SURFACE = "var(--pf-surface, #111111)";
const BORDER = "var(--pf-border, rgba(255,255,255,0.07))";
const DIVIDER = "var(--pf-divider, rgba(255,255,255,0.06))";
const TEXT_PRI = "var(--pf-text-pri, #F5F5F5)";
const TEXT_SEC = "var(--pf-text-sec, rgba(255,255,255,0.45))";
const FONT = "'Inter', system-ui, sans-serif";

interface Props {
  profile: UserProfile;
  onChange: (updated: Partial<UserProfile>) => void;
}

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
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
}

export function UserInfoSection({ profile, onChange }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Partial<UserProfile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (f: string, v: string) => {
    setEditingField(f);
    setTempValues({ [f]: v });
  };
  const cancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };
  const confirmEdit = (f: string) => {
    onChange({ [f]: tempValues[f as keyof UserProfile] });
    setEditingField(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => onChange({ avatarUrl: ev.target?.result as string });
      r.readAsDataURL(file);
    }
  };

  /* ── Editable field ── */
  const Field = ({
    field,
    label,
    value,
    multiline = false,
    readOnly = false,
    hint,
  }: {
    field: string;
    label: string;
    value: string;
    multiline?: boolean;
    readOnly?: boolean;
    hint?: string;
  }) => {
    const editing = editingField === field;
    return (
      <div
        style={{ padding: "15px 22px", borderBottom: `1px solid ${DIVIDER}` }}
        className="profile-field-last"
      >
        <p
          style={{
            fontSize: 11,
            color: TEXT_SEC,
            marginBottom: 5,
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </p>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {multiline ? (
              <textarea
                autoFocus
                rows={3}
                value={
                  (tempValues[field as keyof UserProfile] as string) ?? value
                }
                onChange={(e) => setTempValues({ [field]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: TEXT_PRI,
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: FONT,
                }}
              />
            ) : (
              <input
                autoFocus
                type="text"
                value={
                  (tempValues[field as keyof UserProfile] as string) ?? value
                }
                onChange={(e) => setTempValues({ [field]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: TEXT_PRI,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: FONT,
                }}
              />
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <button
                onClick={() => confirmEdit(field)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 14px",
                  borderRadius: 7,
                  border: "none",
                  background: "#fff",
                  color: "#000",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 14px",
                  borderRadius: 7,
                  border: "none",
                  background: "rgba(255,255,255,0.08)",
                  color: TEXT_PRI,
                  fontSize: 12,
                  fontWeight: 400,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  color: TEXT_PRI,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {value || (
                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontStyle: "italic",
                    }}
                  >
                    Not set
                  </span>
                )}
              </p>
              {hint && (
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 3,
                  }}
                >
                  {hint}
                </p>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              {readOnly ? (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 10px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Read-only
                </span>
              ) : (
                <button
                  onClick={() => startEdit(field, value)}
                  style={{
                    padding: 5,
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.35)",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_PRI)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                  }
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`.profile-field-last:last-child { border-bottom: none !important; }`}</style>

      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          User Information
        </h2>
        <p
          style={{
            fontSize: 13,
            color: TEXT_SEC,
            marginTop: 5,
            lineHeight: 1.5,
          }}
        >
          Manage your personal details and public profile settings.
        </p>
      </div>

      {/* Avatar card */}
      <Card style={{ marginBottom: 8, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${BORDER}`,
                display: "block",
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: `2px solid #0A0A0A`,
                background: "#2a2a2a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Camera size={10} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#fff",
                margin: 0,
              }}
            >
              {profile.displayName}
            </p>
            <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 3 }}>
              {profile.email}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 9,
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: FONT,
                textDecoration: "underline",
                textDecorationColor: "rgba(255,255,255,0.2)",
              }}
            >
              Change profile picture
            </button>
          </div>
        </div>
      </Card>

      {/* Fields card */}
      <Card>
        <Field
          field="displayName"
          label="Display Name"
          value={profile.displayName}
        />
        <Field
          field="email"
          label="Email Address"
          value={profile.email}
          readOnly={profile.isGoogleSignIn}
          hint={
            profile.isGoogleSignIn ? "Managed by Google Sign-In" : undefined
          }
        />
        <Field field="bio" label="Bio / About" value={profile.bio} multiline />
      </Card>

      {/* Google banner */}
      {profile.isGoogleSignIn && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 16px",
            borderRadius: 10,
            background: "rgba(66,133,244,0.09)",
            border: "1px solid rgba(66,133,244,0.2)",
          }}
        >
          <svg
            style={{ width: 15, height: 15, flexShrink: 0 }}
            viewBox="0 0 24 24"
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
          <p
            style={{ fontSize: 12, color: "rgba(147,197,253,0.85)", margin: 0 }}
          >
            Your account is connected via Google. Some fields are managed by
            Google.
          </p>
        </div>
      )}
    </div>
  );
}
