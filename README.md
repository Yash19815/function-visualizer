# Function Visualizer

A powerful React-based application for visualizing code structure and function call relationships. Paste your code and instantly see an interactive graph showing functions, their definitions, and where they're called.

## Features

- **Multi-Language Support**: JavaScript, TypeScript, Python, and Java
- **Interactive Graph Visualization**: Hierarchical layout with React Flow
  - Function definition nodes at the top
  - Individual call site nodes showing each function invocation
  - Color-coded connections matching called functions
  - Animated edges showing call flow
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
- **Dark Theme**: Consistent dark UI matching modern development tools
- **Mini Map**: Navigate large graphs easily with visual overview
- **Smart Parsing**:
  - Detects function definitions, classes, and methods
  - Tracks individual function calls with line numbers
  - Skips decorators, annotations, and definition lines
  - Shows call context and parameters

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build

Create a production build:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Select Language**: Choose from JavaScript, Python, Java, or TypeScript
2. **Add Code**:
   - Paste code directly into the Monaco editor
   - Upload a code file
   - Or start typing
3. **Switch Views**:
   - **List View**: See functions and calls in a structured list
   - **Graph View**: Visualize the call graph with interactive nodes

## Graph Visualization

### Understanding the Graph

- **Function Nodes** (Large, top layer): Function/method definitions
  - Shows function name, type, line number, and parameters
  - Colored border indicates the function's assigned color
- **Call Site Nodes** (Small, middle layer): Individual function invocations
  - Shows "Call" label with line number
  - Colored to match the function being called
  - Multiple calls to the same function = multiple call nodes

- **Edges** (Connections):
  - Dashed lines: From caller function to call site (context)
  - Solid animated lines: From call site to called function (invocation)

### Example

For this Python code:

```python
def greet(name):
    return f"Hello, {name}"

def main():
    greet("Alice")  # Line 5
    greet("Bob")    # Line 6
```

The graph shows:

- 2 function nodes: `greet` and `main`
- 2 call sites: Line 5 and Line 6
- Both call sites colored to match `greet`
- Connections showing `main` → call sites → `greet`

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Monaco Editor**: Code editor
- **React Flow**: Graph visualization
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible components

## Project Structure

```
function-visualizer/
├── src/
│   ├── components/
│   │   ├── CallGraph.tsx       # Graph visualization
│   │   ├── CodeEditor.tsx      # Monaco editor wrapper
│   │   └── FunctionVisualizer.tsx  # Main visualizer component
│   ├── utils/
│   │   └── codeParser.ts       # Language parsers
│   ├── App.tsx                 # Root component
│   └── index.css              # Global styles
├── public/                     # Static assets
└── Build/                     # Production build output
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International license.

Commercial use is prohibited without a paid license. See COMMERCIAL-LICENSE.md for details.
