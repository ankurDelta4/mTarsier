import { useState } from "react";
import { parseMcpPaste, type ParseResult, type ParsedServer } from "../../lib/parseMcpPaste";

interface Props {
  onParsed: (servers: ParsedServer[]) => void;
}

function PasteJsonMode({ onParsed }: Props) {
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (!text.trim()) {
      setResult(null);
      onParsed([]);
      return;
    }
    const r = parseMcpPaste(text);
    setResult(r);
    onParsed(r.ok ? r.servers : []);
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        defaultValue=""
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={'{\n  "mcpServers": {\n    "my-server": {\n      "command": "npx",\n      "args": ["-y", "package-name"]\n    }\n  }\n}'}
        className="h-[160px] w-full px-2.5 py-2 text-xs font-mono bg-base border border-border rounded-md text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 resize-none"
      />
      {result && !result.ok && (
        <p className="text-xs text-amber-400">{result.error}</p>
      )}
    </div>
  );
}

export default PasteJsonMode;
