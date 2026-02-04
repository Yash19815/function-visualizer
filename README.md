# Function Visualizer

A powerful React-based application for visualizing code structure and function call relationships. Paste your code and instantly see an interactive graph showing functions, their definitions, and where they're called.

![Function Visualizer](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## ✨ Features

### 🎨 Visualization

- **Interactive Graph View**: Horizontal layout with React Flow
  - Function definition nodes on the left
  - Call site nodes on the right
  - Straight dashed edges connecting calls
  - Color-coded nodes for easy tracking
- **Mini Map**: Navigate large graphs easily (bottom-right corner)
- **Zoom Controls**: Pan, zoom, and reset view with one click

### 💻 Code Editor

- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting
- **Multi-Language Support**: JavaScript, TypeScript, Python, and Java
- **Smart Parsing**:
  - Detects function definitions, classes, and methods
  - Tracks individual function calls with line numbers
  - Skips decorators, annotations, and comments
  - Shows call context and parameters

### 📊 View Modes

- **List View**: See functions and calls in a structured list format
- **Graph View**: Interactive visualization of call relationships

### 🎯 Export Options

- Export as JSON (function data and call graph)
- Export as JPEG (graph visualization)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
git clone https://github.com/Yash19815/function-visualizer
cd function-visualizer
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

## 📖 How to Use

1. **Select Language**: Choose from JavaScript, Python, Java, or TypeScript
2. **Add Code**:
   - Paste code directly into the Monaco editor
   - Upload a code file
   - Or start typing
3. **Switch Views**:
   - **List View**: See functions and calls in a structured list
   - **Graph View**: Visualize the call graph with interactive nodes
4. **Export**: Download your visualization as JSON or JPEG

## 🎨 Graph Visualization

### Understanding the Graph

- **Function Nodes** (Left side, larger): Function/method definitions
  - Shows function name, type, line number, and parameters
  - Auto-adjusts width based on function name length
  - Colored border indicates the function's assigned color
- **Call Site Nodes** (Right side, smaller): Individual function invocations
  - Shows "Call" label with line number (L##)
  - Arranged horizontally when a function has multiple calls
  - Gradient border when multiple functions are called on the same line
- **Edges** (Connections):
  - Straight dashed lines connecting function to call sites
  - Color-matched to the called function
  - Arrow indicates call direction

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

- 2 function nodes on the left: `greet` and `main`
- 2 call site nodes on the right: Line 5 and Line 6 (arranged horizontally)
- Dashed edges connecting `main` to both call sites, then to `greet`

## 🛠️ Tech Stack

- **React 18**: UI framework with hooks
- **TypeScript**: Type safety and better DX
- **Vite**: Lightning-fast build tool and dev server
- **Monaco Editor**: VS Code's editor component
- **React Flow**: Powerful graph visualization library
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library

## 📁 Project Structure

```
function-visualizer/
├── src/
│   ├── components/
│   │   ├── CallGraph.tsx           # Graph visualization with ReactFlow
│   │   ├── CodeEditor.tsx          # Monaco editor wrapper
│   │   └── FunctionVisualizer.tsx  # Main visualizer component
│   ├── utils/
│   │   └── codeParser.ts           # Multi-language code parsers
│   ├── App.tsx                     # Root component
│   └── index.css                   # Global styles (Tailwind)
├── public/                         # Static assets
└── build/                          # Production build output
```

## 🎯 Features in Detail

### Dynamic Node Sizing

- Function nodes auto-expand to fit long function names
- All content is center-aligned for better readability
- Prevents text overflow and truncation

### Horizontal Layout

- Functions positioned on the left
- Call sites positioned on the right
- Multiple calls arranged horizontally (side by side)
- Clean, readable layout for complex call graphs

### Edge Routing

- Straight dashed lines for clarity
- Dynamic source/target positioning
- Color-coded to match called functions

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International** license.

**Commercial use is prohibited** without a paid license. See `COMMERCIAL-LICENSE.md` for details.

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies and open-source libraries.

---

Made by [Yash19815](https://github.com/Yash19815)
