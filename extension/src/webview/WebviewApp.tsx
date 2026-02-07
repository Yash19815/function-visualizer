import React, { useState, useEffect } from "react";
import { FunctionVisualizer } from "@shared/components/FunctionVisualizer";
import type {
  FunctionInfo,
  CallInfo,
  CallSite,
} from "@shared/utils/codeParser";

/**
 * Main webview application component
 * Receives parsed code data from the extension host
 */
export default function WebviewApp() {
  const [parsedData, setParsedData] = useState<{
    functions: FunctionInfo[];
    calls: CallInfo[];
    callSites: CallSite[];
  }>({
    functions: [],
    calls: [],
    callSites: [],
  });
  const [language, setLanguage] = useState<
    "javascript" | "typescript" | "python" | "java"
  >("javascript");
  const [fileName, setFileName] = useState<string>("");

  // Access the VS Code API that was acquired in index.tsx
  const vscode = React.useMemo(() => {
    if (typeof window !== "undefined" && (window as any).vscodeApi) {
      return (window as any).vscodeApi;
    }
    return null;
  }, []);

  useEffect(() => {
    // Listen for messages from the extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "update":
          setParsedData(message.data.parsed);
          setLanguage(message.data.language);
          setFileName(message.data.fileName || "");
          break;
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  // Send messages back to extension
  const handleExport = (type: "json" | "jpeg", content: any) => {
    if (vscode) {
      vscode.postMessage({
        type: "export",
        data: { type, content },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <header className="border-b border-gray-800 bg-[#161b22] px-6 py-3">
        <h1 className="text-lg text-white font-semibold">
          Function Visualizer {fileName && `- ${fileName}`}
        </h1>
      </header>
      <div className="h-[calc(100vh-60px)]">
        <FunctionVisualizer
          functions={parsedData.functions}
          calls={parsedData.calls}
          callSites={parsedData.callSites}
          language={language}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
