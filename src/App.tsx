import React, { useState } from "react";
import { Resizable } from "re-resizable";
import { CodeEditor } from "./components/CodeEditor";
import { FunctionVisualizer } from "./components/FunctionVisualizer";
import { parseCode } from "./utils/codeParser";

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<
    "javascript" | "python" | "java" | "typescript"
  >("python");

  const parsedData = parseCode(code, language);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100">
      <header className="border-b border-gray-800 bg-[#161b22] px-6 py-4">
        <h1 className="text-xl text-white">Code Function Visualizer</h1>
        <p className="text-sm text-gray-400 mt-1">
          Analyze and visualize function structure and relationships
        </p>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <Resizable
          defaultSize={{
            width: "50%",
            height: "100%",
          }}
          minWidth="30%"
          maxWidth="70%"
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          handleStyles={{
            right: {
              width: "4px",
              right: "-2px",
              cursor: "col-resize",
              backgroundColor: "transparent",
              transition: "background-color 0.2s",
            },
          }}
          handleClasses={{
            right: "hover:bg-blue-500",
          }}
        >
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
          />
        </Resizable>
        <FunctionVisualizer
          functions={parsedData.functions}
          calls={parsedData.calls}
          callSites={parsedData.callSites}
          language={language}
        />
      </div>
    </div>
  );
}
