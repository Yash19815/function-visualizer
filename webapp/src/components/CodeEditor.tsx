import React, { useRef, useEffect } from "react";
import { Upload, Copy, FileCode } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language:
    | "javascript"
    | "python"
    | "java"
    | "typescript"
    | "c"
    | "cpp"
    | "r"
    | "go"
    | "rust"
    | "php"
    | "ruby"
    | "swift";
  onLanguageChange: (
    language:
      | "javascript"
      | "python"
      | "java"
      | "typescript"
      | "c"
      | "cpp"
      | "r"
      | "go"
      | "rust"
      | "php"
      | "ruby"
      | "swift",
  ) => void;
}

const detectLanguageFromFile = (
  filename: string,
):
  | "javascript"
  | "python"
  | "java"
  | "typescript"
  | "c"
  | "cpp"
  | "r"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "swift" => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "c":
    case "h":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
    case "hxx":
      return "cpp";
    case "r":
      return "r";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "swift":
      return "swift";
    default:
      return "javascript";
  }
};

export function CodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Auto-detect language from file extension
      const detectedLanguage = detectLanguageFromFile(file.name);
      onLanguageChange(detectedLanguage);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-800">
      <div className="bg-[#161b22] border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-gray-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as any)}
            className="bg-[#0d1117] border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="r">R</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm transition-colors"
          >
            <Copy className="w-4 h-4" />
            Paste
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.h,.cpp,.cc,.cxx,.hpp,.hxx,.r,.go,.rs,.php,.rb,.swift"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingIndent: "indent",
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: "selection",
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
            },
            padding: {
              top: 16,
              bottom: 16,
            },
          }}
        />
      </div>
    </div>
  );
}
