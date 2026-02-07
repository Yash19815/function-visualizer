# Function Visualizer Webapp

A powerful React-based web application for visualizing code structure and function call graphs. This is the standalone web version of the Function Visualizer, allowing you to analyze code directly in your browser.

## 🚀 Features

- **Interactive Graph Visualization**:
  - Dynamically generated call graphs using React Flow.
  - Visualization of function nodes (name, type, params).
  - Visualization of call relationships and call sites.
  - Interactive zooming, panning, and node dragging.

- **Multi-Language Support**:
  - JavaScript (`.js`)
  - TypeScript (`.ts`, `.tsx`)
  - Python (`.py`)
  - Java (`.java`)
  - C/C++ (`.c`, `.cpp`)
  - Go (`.go`)
  - Rust (`.rs`)
  - Php (`.php`)
  - Ruby (`.rb`)
  - Swift (`.swift`)

- **Flexible Input Methods**:
  - **Code Editor**: Built-in Monaco Editor for typing or pasting code.
  - **File Upload**: Upload source files directly for analysis.
  - **Drag & Drop**: Drag files into the editor to load them.

- **View Modes**:
  - **Graph View**: Visual representation of the call stack.
  - **List View**: Detailed list of functions and their relationships.

- **Export Capabilities**:
  - Export analysis data as JSON.
  - Export graph visualization as JPEG images.

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Graphing Engine**: React Flow & Dagre (for layout)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Icons**: Lucide React

## 📦 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd function-visualizer/webapp
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Building for Production

To build the web application for production:

```bash
npm run build
```

The output will be generated in the `../build` directory (relative to the `webapp` folder).

## 🧪 Running Tests

To preview the production build locally:

```bash
npm run preview
```

## 📂 Project Structure

```
webapp/
├── src/
│   ├── components/       # Webapp-specific React components
│   │   ├── CodeEditor.tsx  # Monaco editor integration
│   │   └── ...
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── ...
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```
