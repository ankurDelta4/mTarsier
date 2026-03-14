import { useState } from "react";
import AuthSection from "./AuthSection";
import type { AuthData } from "./AuthSection";

export interface HttpFormData {
  url: string;
  headers: Record<string, string>;
  bearerToken?: string;
  auth?: { CLIENT_ID: string; CLIENT_SECRET: string; scopes: string[] };
}

interface Props {
  url: string;
  headers: Record<string, string>;
  initialAuth?: AuthData;
  onChange: (data: HttpFormData) => void;
}

function buildOutput(url: string, headers: Record<string, string>, authData: AuthData): HttpFormData {
  if (authData.type === "bearer" && authData.bearerToken?.trim()) {
    return { url, headers, bearerToken: authData.bearerToken.trim() };
  }
  if (authData.type === "oauth") {
    return {
      url,
      headers,
      auth: {
        CLIENT_ID: authData.clientId ?? "",
        CLIENT_SECRET: authData.clientSecret ?? "",
        scopes: authData.scopes ? authData.scopes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      },
    };
  }
  return { url, headers };
}

function HttpForm({ url, headers, initialAuth, onChange }: Props) {
  const [showValues, setShowValues] = useState(false);
  const [authData, setAuthData] = useState<AuthData>(initialAuth ?? { type: "none" });
  const entries = Object.entries(headers);

  const emit = (newUrl: string, newHeaders: Record<string, string>, newAuth: AuthData) => {
    onChange(buildOutput(newUrl, newHeaders, newAuth));
  };

  const addHeader = () => emit(url, { ...headers, "": "" }, authData);

  const updateHeaderKey = (_: string, newKey: string, idx: number) => {
    const newHeaders: Record<string, string> = {};
    entries.forEach(([k, v], i) => { newHeaders[i === idx ? newKey : k] = v; });
    emit(url, newHeaders, authData);
  };

  const updateHeaderValue = (key: string, val: string) => {
    emit(url, { ...headers, [key]: val }, authData);
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    emit(url, newHeaders, authData);
  };

  const handleAuthChange = (newAuth: AuthData) => {
    setAuthData(newAuth);
    emit(url, headers, newAuth);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-text-muted mb-1 block">URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => emit(e.target.value, headers, authData)}
          placeholder="http://localhost:3000/sse"
          className="w-full px-2.5 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
        />
      </div>
      <AuthSection value={authData} onChange={handleAuthChange} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text-muted">Headers</label>
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="text-[10px] text-text-muted hover:text-text"
          >
            {showValues ? "Hide values" : "Show values"}
          </button>
        </div>
        {entries.map(([key, val], idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={key}
              onChange={(e) => updateHeaderKey(key, e.target.value, idx)}
              placeholder="Header-Name"
              className="flex-1 px-2 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
            />
            <input
              type={showValues ? "text" : "password"}
              value={val}
              onChange={(e) => updateHeaderValue(key, e.target.value)}
              placeholder="value"
              className="flex-1 px-2 py-1.5 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={() => removeHeader(key)}
              className="text-text-muted hover:text-red-400 text-xs px-1"
            >
              x
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHeader}
          className="text-xs text-primary/70 hover:text-primary"
        >
          + Add header
        </button>
      </div>
    </div>
  );
}

export default HttpForm;
