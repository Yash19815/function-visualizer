interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type: "function" | "class" | "method" | "arrow";
}

interface CallData {
  from: string;
  to: string;
  lineNumber?: number;
  context?: string;
}

interface CallSiteNode {
  id: string;
  callerName: string;
  calleeName: string;
  lineNumber: number;
  context?: string;
}

interface ParsedCode {
  functions: FunctionData[];
  calls: CallData[];
  callSites: CallSiteNode[];
}

export function parseCode(code: string, language: string): ParsedCode {
  if (!code.trim()) {
    return { functions: [], calls: [], callSites: [] };
  }

  const lines = code.split("\n");
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];

  switch (language) {
    case "javascript":
    case "typescript":
      return parseJavaScript(code, lines);
    case "python":
      return parsePython(code, lines);
    case "java":
      return parseJava(code, lines);
    case "c":
      return parseC(code, lines);
    case "cpp":
      return parseCpp(code, lines);
    case "r":
      return parseR(code, lines);
    case "go":
      return parseGo(code, lines);
    case "rust":
      return parseRust(code, lines);
    case "php":
      return parsePhp(code, lines);
    case "ruby":
      return parseRuby(code, lines);
    case "swift":
      return parseSwift(code, lines);
    default:
      return { functions: [], calls: [], callSites: [] };
  }
}

function parseJavaScript(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  // Remove comments to avoid false positives
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "") // Multi-line comments
    .replace(/\/\/.*/g, ""); // Single-line comments

  // Regular function declarations
  const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      type: "function",
    });
  }

  // Arrow functions
  const arrowRegex =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
  while ((match = arrowRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      type: "arrow",
    });
  }

  // Class methods
  const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;
  while ((match = methodRegex.exec(codeWithoutComments)) !== null) {
    const name = match[1];
    // Skip keywords
    if (["if", "while", "for", "switch", "catch"].includes(name)) continue;

    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    const alreadyAdded = functions.some(
      (f) => f.name === name && f.lineNumber === lineNumber,
    );
    if (!alreadyAdded) {
      functions.push({
        name,
        lineNumber,
        params: match[2]
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        type: "method",
      });
    }
  }

  // Classes
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls with line numbers and context
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  // Parse each line to find function calls
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Skip comment-only lines
    if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("*")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      // Match function calls: functionName(...)
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        // CRITICAL: Skip if this line is a function definition
        // Check for: function fnName, def fnName, class fnName, const fnName =, etc.
        const isDefinition =
          /(?:function|def|class|const|let|var)\s+/.test(trimmedLine) ||
          /(?:async\s+)?\w+\s*\([^)]*\)\s*(?:=>|{)/.test(trimmedLine);

        if (isDefinition) {
          // This is a function definition, not a call
          return;
        }
        // Try to determine the calling context
        let caller = "global";

        // Find which function this line belongs to
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            // Check if this line is within this function's scope (simple heuristic)
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100), // First 100 chars
          });

          // Create a call site node for this specific call
          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

function parsePython(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  // Remove comments to avoid false positives
  const codeWithoutComments = code
    .replace(/#.*/g, "") // Single-line comments
    .replace(/'''[\s\S]*?'''/g, "") // Triple-quoted strings (docstrings)
    .replace(/"""[\s\S]*?"""/g, ""); // Triple double-quoted strings

  // Function definitions
  const funcRegex = /def\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split("=")[0].split(":")[0].trim())
        .filter(Boolean),
      type: "function",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls with line numbers
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Skip comment-only lines
    if (
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith('"""') ||
      trimmedLine.startsWith("'''")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        // CRITICAL: Skip if this line is a function definition
        // Check for: def fnName( or class fnName
        if (
          trimmedLine.startsWith("def ") ||
          trimmedLine.startsWith("class ") ||
          trimmedLine.startsWith("@")
        ) {
          // This is a function/class definition or decorator, not a call
          return;
        }

        let caller = "global";

        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          // Create a call site node for this specific call
          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

function parseJava(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  // Remove comments to avoid false positives
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "") // Multi-line comments
    .replace(/\/\/.*/g, ""); // Single-line comments

  // Method definitions (public, private, protected, static, etc.)
  const methodRegex =
    /(?:public|private|protected|static|\s)+[\w<>[\]]+\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = methodRegex.exec(codeWithoutComments)) !== null) {
    const name = match[1];
    // Skip keywords
    if (["if", "while", "for", "switch", "catch", "return"].includes(name))
      continue;

    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name,
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(/\s+/).pop() || "")
        .filter(Boolean),
      type: "method",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls with line numbers
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    // Skip comment-only lines
    if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("*")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        // CRITICAL: Skip if this line is a method/class definition
        // Check for Java method signatures: public/private/protected void methodName(
        if (
          /(?:public|private|protected|static|final|abstract|synchronized)\s/.test(
            trimmedLine,
          ) ||
          trimmedLine.startsWith("class ") ||
          trimmedLine.startsWith("@")
        ) {
          // This is a method/class definition or annotation, not a call
          return;
        }

        let caller = "global";

        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          // Create a call site node for this specific call
          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// C language parser
function parseC(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  // Remove comments
  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "") // Multi-line comments
    .replace(/\/\/.*/g, ""); // Single-line comments

  // Function definitions: returnType functionName(params)
  const funcRegex =
    /\b(?:void|int|char|float|double|long|short|unsigned|signed|struct\s+\w+|\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g;
  let match: RegExpExecArray | null;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const name = match[1];
    // Skip keywords
    if (["if", "while", "for", "switch", "return"].includes(name)) continue;

    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name,
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(/\s+/).pop() || "")
        .filter(Boolean),
      type: "function",
    });
  }

  // Struct definitions
  const structRegex = /struct\s+(\w+)/g;
  let structMatch: RegExpExecArray | null;
  while ((structMatch = structRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, structMatch.index)
      .split("\n").length;

    // Avoid duplicates
    const alreadyAdded = functions.some(
      (f) => f.name === structMatch![1] && f.lineNumber === lineNumber,
    );
    if (!alreadyAdded) {
      functions.push({
        name: structMatch[1],
        lineNumber,
        params: [],
        type: "class",
      });
    }
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("*")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        // Skip function definitions
        if (
          /\b(?:void|int|char|float|double|long|short|unsigned|signed|struct)\s+/.test(
            trimmedLine,
          )
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// C++ language parser
function parseCpp(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");

  // Function definitions
  const funcRegex =
    /\b(?:void|int|char|float|double|long|short|unsigned|signed|bool|auto|string|std::\w+|[\w:]+)\s+(\w+)\s*\(([^)]*)\)\s*(?:const\s*)?{/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const name = match[1];
    if (["if", "while", "for", "switch", "return", "catch"].includes(name))
      continue;

    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name,
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(/\s+/).pop() || "")
        .filter(Boolean),
      type: "function",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Namespace definitions (treated as classes)
  const namespaceRegex = /namespace\s+(\w+)/g;
  while ((match = namespaceRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("*")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        if (
          /\b(?:void|int|char|float|double|bool|class|namespace)\s+/.test(
            trimmedLine,
          ) ||
          trimmedLine.startsWith("class ") ||
          trimmedLine.startsWith("namespace ")
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// R language parser
function parseR(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code.replace(/#.*/g, "");

  // Function definitions: functionName <- function(params) or functionName = function(params)
  const funcRegex = /(\w+)\s*(?:<-|=)\s*function\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split("=")[0].trim())
        .filter(Boolean),
      type: "function",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("#")) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        // Skip function definitions
        if (/<-\s*function|=\s*function/.test(trimmedLine)) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// Go language parser
function parseGo(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");

  // Function definitions: func functionName(params) returnType
  const funcRegex = /func\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(/\s+/)[0])
        .filter(Boolean),
      type: "function",
    });
  }

  // Method definitions: func (receiver) methodName(params)
  const methodRegex = /func\s*\([^)]+\)\s*(\w+)\s*\(([^)]*)\)/g;
  while ((match = methodRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(/\s+/)[0])
        .filter(Boolean),
      type: "method",
    });
  }

  // Struct definitions
  const structRegex = /type\s+(\w+)\s+struct/g;
  while ((match = structRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("//") || trimmedLine.startsWith("/*")) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        if (
          trimmedLine.startsWith("func ") ||
          trimmedLine.startsWith("type ")
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// Rust language parser
function parseRust(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");

  // Function definitions: fn functionName(params) -> returnType or fn functionName(params)
  const funcRegex = /fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().split(":")[0].trim())
        .filter(Boolean),
      type: "function",
    });
  }

  // Struct definitions
  const structRegex = /struct\s+(\w+)/g;
  while ((match = structRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Trait definitions
  const traitRegex = /trait\s+(\w+)/g;
  while ((match = traitRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("//") || trimmedLine.startsWith("/*")) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        if (
          trimmedLine.startsWith("fn ") ||
          trimmedLine.startsWith("struct ") ||
          trimmedLine.startsWith("trait ")
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// PHP language parser
function parsePhp(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/#.*/g, "");

  // Function definitions
  const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => p.trim().replace(/^\$/, ""))
        .filter(Boolean),
      type: "function",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Method definitions with visibility modifiers
  const methodRegex =
    /(?:public|private|protected|static)\s+function\s+(\w+)\s*\(([^)]*)\)/g;
  while ((match = methodRegex.exec(codeWithoutComments)) !== null) {
    const name = match[1];
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;

    const alreadyAdded = functions.some(
      (f) => f.name === name && f.lineNumber === lineNumber,
    );
    if (!alreadyAdded) {
      functions.push({
        name,
        lineNumber,
        params: match[2]
          .split(",")
          .map((p) => p.trim().replace(/^\$/, ""))
          .filter(Boolean),
        type: "method",
      });
    }
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith("//") ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("#")
    ) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        if (
          trimmedLine.startsWith("function ") ||
          trimmedLine.startsWith("class ") ||
          /(?:public|private|protected)\s+function/.test(trimmedLine)
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// Ruby language parser
function parseRuby(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code.replace(/#.*/g, "");

  // Method definitions
  const funcRegex = /def\s+(\w+)(?:\s*\(([^)]*)\))?/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        ? match[2]
            .split(",")
            .map((p) => p.trim().split("=")[0].trim())
            .filter(Boolean)
        : [],
      type: "function",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Module definitions
  const moduleRegex = /module\s+(\w+)/g;
  while ((match = moduleRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("#")) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(?`, "g");
      if (callRegex.test(line)) {
        if (
          trimmedLine.startsWith("def ") ||
          trimmedLine.startsWith("class ") ||
          trimmedLine.startsWith("module ")
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}

// Swift language parser
function parseSwift(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];
  const callSites: CallSiteNode[] = [];

  const codeWithoutComments = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");

  // Function definitions
  const funcRegex = /func\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2]
        .split(",")
        .map((p) => {
          const parts = p.trim().split(":");
          return parts[0].trim().split(/\s+/).pop() || "";
        })
        .filter(Boolean),
      type: "function",
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Struct definitions
  const structRegex = /struct\s+(\w+)/g;
  while ((match = structRegex.exec(codeWithoutComments)) !== null) {
    const lineNumber = codeWithoutComments
      .substring(0, match.index)
      .split("\n").length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: "class",
    });
  }

  // Find function calls
  const functionNames = functions.map((f) => f.name);
  let callSiteCounter = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("//") || trimmedLine.startsWith("/*")) {
      return;
    }

    functionNames.forEach((fnName) => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      if (callRegex.test(line)) {
        if (
          trimmedLine.startsWith("func ") ||
          trimmedLine.startsWith("class ") ||
          trimmedLine.startsWith("struct ")
        ) {
          return;
        }

        let caller = "global";
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }

        const exists = calls.some(
          (c) =>
            c.from === caller && c.to === fnName && c.lineNumber === lineNumber,
        );

        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });

          callSites.push({
            id: `call_${callSiteCounter++}`,
            callerName: caller,
            calleeName: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 50),
          });
        }
      }
    });
  });

  return { functions, calls, callSites };
}
