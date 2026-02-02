interface FunctionData {
  name: string;
  lineNumber: number;
  params: string[];
  type: 'function' | 'class' | 'method' | 'arrow';
}

interface CallData {
  from: string;
  to: string;
  lineNumber?: number;
  context?: string;
}

interface ParsedCode {
  functions: FunctionData[];
  calls: CallData[];
}

export function parseCode(code: string, language: string): ParsedCode {
  if (!code.trim()) {
    return { functions: [], calls: [] };
  }

  const lines = code.split('\n');
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];

  switch (language) {
    case 'javascript':
    case 'typescript':
      return parseJavaScript(code, lines);
    case 'python':
      return parsePython(code, lines);
    case 'java':
      return parseJava(code, lines);
    default:
      return { functions: [], calls: [] };
  }
}

function parseJavaScript(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];

  // Regular function declarations
  const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2].split(',').map(p => p.trim()).filter(Boolean),
      type: 'function',
    });
  }

  // Arrow functions
  const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
  while ((match = arrowRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2].split(',').map(p => p.trim()).filter(Boolean),
      type: 'arrow',
    });
  }

  // Class methods
  const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;
  while ((match = methodRegex.exec(code)) !== null) {
    const name = match[1];
    // Skip keywords
    if (['if', 'while', 'for', 'switch', 'catch'].includes(name)) continue;
    
    const lineNumber = code.substring(0, match.index).split('\n').length;
    const alreadyAdded = functions.some(f => f.name === name && f.lineNumber === lineNumber);
    if (!alreadyAdded) {
      functions.push({
        name,
        lineNumber,
        params: match[2].split(',').map(p => p.trim()).filter(Boolean),
        type: 'method',
      });
    }
  }

  // Classes
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: 'class',
    });
  }

  // Find function calls with line numbers and context
  const functionNames = functions.map(f => f.name);
  
  // Parse each line to find function calls
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    functionNames.forEach(fnName => {
      // Match function calls: functionName(...)
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
      if (callRegex.test(line)) {
        // Try to determine the calling context
        let caller = 'global';
        
        // Find which function this line belongs to
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            // Check if this line is within this function's scope (simple heuristic)
            caller = func.name;
            break;
          }
        }
        
        const exists = calls.some(c => 
          c.from === caller && 
          c.to === fnName && 
          c.lineNumber === lineNumber
        );
        
        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100), // First 100 chars
          });
        }
      }
    });
  });

  return { functions, calls };
}

function parsePython(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];

  // Function definitions
  const funcRegex = /def\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: match[2].split(',').map(p => p.trim().split('=')[0].split(':')[0].trim()).filter(Boolean),
      type: 'function',
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: 'class',
    });
  }

  // Find function calls with line numbers
  const functionNames = functions.map(f => f.name);
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    functionNames.forEach(fnName => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
      if (callRegex.test(line)) {
        let caller = 'global';
        
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }
        
        const exists = calls.some(c => 
          c.from === caller && 
          c.to === fnName && 
          c.lineNumber === lineNumber
        );
        
        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });
        }
      }
    });
  });

  return { functions, calls };
}

function parseJava(code: string, lines: string[]): ParsedCode {
  const functions: FunctionData[] = [];
  const calls: CallData[] = [];

  // Method definitions (public, private, protected, static, etc.)
  const methodRegex = /(?:public|private|protected|static|\s)+[\w<>[\]]+\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = methodRegex.exec(code)) !== null) {
    const name = match[1];
    // Skip keywords
    if (['if', 'while', 'for', 'switch', 'catch', 'synchronized'].includes(name)) continue;
    
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name,
      lineNumber,
      params: match[2].split(',').map(p => p.trim().split(/\s+/).pop() || '').filter(Boolean),
      type: 'method',
    });
  }

  // Class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    const lineNumber = code.substring(0, match.index).split('\n').length;
    functions.push({
      name: match[1],
      lineNumber,
      params: [],
      type: 'class',
    });
  }

  // Find function calls with line numbers
  const functionNames = functions.map(f => f.name);
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    functionNames.forEach(fnName => {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
      if (callRegex.test(line)) {
        let caller = 'global';
        
        for (let i = functions.length - 1; i >= 0; i--) {
          const func = functions[i];
          if (func.lineNumber < lineNumber && func.name !== fnName) {
            caller = func.name;
            break;
          }
        }
        
        const exists = calls.some(c => 
          c.from === caller && 
          c.to === fnName && 
          c.lineNumber === lineNumber
        );
        
        if (!exists) {
          calls.push({
            from: caller,
            to: fnName,
            lineNumber: lineNumber,
            context: trimmedLine.substring(0, 100),
          });
        }
      }
    });
  });

  return { functions, calls };
}