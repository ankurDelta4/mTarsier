import { useState } from "react";

export type AuthType = "none" | "bearer" | "oauth";

export interface AuthData {
  type: AuthType;
  bearerToken?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string;
}

interface Props {
  value: AuthData;
  onChange: (data: AuthData) => void;
}

const AUTH_LABELS: Record<AuthType, string> = {
  none: "None",
  bearer: "Bearer Token",
  oauth: "OAuth",
};

function AuthSection({ value, onChange }: Props) {
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted">Auth</label>
        {value.type !== "none" && (
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="text-[10px] text-text-muted hover:text-text"
          >
            {showSecrets ? "Hide secrets" : "Show secrets"}
          </button>
        )}
      </div>
      <div className="flex gap-1.5">
        {(["none", "bearer", "oauth"] as AuthType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...value, type: t })}
            className={`px-2.5 py-1 text-[11px] rounded-md border ${
              value.type === t
                ? "border-primary/50 text-primary bg-primary/10"
                : "border-border text-text-muted hover:text-text"
            }`}
          >
            {AUTH_LABELS[t]}
          </button>
        ))}
      </div>
      {value.type === "bearer" && (
        <input
          type={showSecrets ? "text" : "password"}
          value={value.bearerToken ?? ""}
          onChange={(e) => onChange({ ...value, bearerToken: e.target.value })}
          placeholder="sk-..."
          className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
        />
      )}
      {value.type === "oauth" && (
        <div className="space-y-2">
          <input
            type="text"
            value={value.clientId ?? ""}
            onChange={(e) => onChange({ ...value, clientId: e.target.value })}
            placeholder="CLIENT_ID"
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
          />
          <input
            type={showSecrets ? "text" : "password"}
            value={value.clientSecret ?? ""}
            onChange={(e) => onChange({ ...value, clientSecret: e.target.value })}
            placeholder="CLIENT_SECRET"
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
          />
          <input
            type="text"
            value={value.scopes ?? ""}
            onChange={(e) => onChange({ ...value, scopes: e.target.value })}
            placeholder="scope1,scope2"
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
          />
        </div>
      )}
    </div>
  );
}

export default AuthSection;
