# Function Visualizer

> A VS Code extension that visualizes function call relationships in your code as an interactive graph.

![Version](https://img.shields.io/badge/version-0.1.2-blue) ![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.107.0-blue) ![Languages](https://img.shields.io/badge/languages-12-green)

---

## ✨ Features

- **Interactive Call Graph**: See how functions call each other in a visual node graph
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, Ruby, R, PHP, and Swift
- **Two Commands**: Visualize an entire file or just a selected snippet
- **Call Site Nodes**: Individual call sites shown separately — know exactly where each function is called
- **Export**: Save the graph as JSON or JPEG
- **Theme Aware**: Matches your VS Code dark/light theme

---

## 🚀 Installation

1. Download the latest `.vsix` file from [Releases](https://github.com/Yash19815/function-visualizer/releases)
2. In VS Code, open the Command Palette (`Ctrl+Shift+P`)
3. Run **Extensions: Install from VSIX...**
4. Select the downloaded `.vsix` file

---

## 🖥️ How to Use

### Visualize a File

1. Open any supported code file (`.js`, `.ts`, `.py`, `.java`, `.c`, `.cpp`, `.go`, etc.)
2. Right-click in the editor → **Visualize: Show Function Graph**
   — or —
   Open the Command Palette (`Ctrl+Shift+P`) → **Visualize: Show Function Graph**
3. The graph panel opens on the right

### Visualize a Selection

1. Select a block of code in the editor
2. Right-click → **Visualize: Show Selection Graph**
   — or —
   Command Palette → **Visualize: Show Selection Graph**

### Keyboard Shortcut

| Action         | Shortcut         |
| -------------- | ---------------- |
| Visualize File | `Ctrl+Shift+V F` |

---

## 📊 Understanding the Graph

| Node Type                           | Description                                    |
| ----------------------------------- | ---------------------------------------------- |
| **Function Node** (left, larger)    | A function/method/class definition             |
| **Call Site Node** (right, smaller) | A specific location where a function is called |

- **Edges** connect function definitions to their call sites
- **Color coding** groups related calls by function
- **Line numbers** shown on call site nodes (e.g. `L12`)
- **Gradient borders** indicate multiple functions called on the same line

### Example

```python
def greet(name):
    return f"Hello, {name}"

def main():
    greet("Alice")  # Call site at Line 5
    greet("Bob")    # Call site at Line 6
```

Graph output:

- Nodes: `greet`, `main`
- Call Sites: `L5`, `L6`
- Edges: `main → L5 → greet`, `main → L6 → greet`

---

## 🌐 Supported Languages

| Language         | Extension     |
| ---------------- | ------------- |
| JavaScript / JSX | `.js`, `.jsx` |
| TypeScript / TSX | `.ts`, `.tsx` |
| Python           | `.py`         |
| Java             | `.java`       |
| C                | `.c`          |
| C++              | `.cpp`        |
| Go               | `.go`         |
| Rust             | `.rs`         |
| Ruby             | `.rb`         |
| PHP              | `.php`        |
| Swift            | `.swift`      |
| R                | `.r`          |

---

## ⚙️ Commands

| Command                                  | Description                       |
| ---------------------------------------- | --------------------------------- |
| `function-visualizer.visualizeFile`      | Visualize the entire active file  |
| `function-visualizer.visualizeSelection` | Visualize the selected code block |
| `function-visualizer.debug`              | Check if the extension is active  |

---

## 📄 License

**Creative Commons Attribution-NonCommercial 4.0 International**

Commercial use requires a paid license. See `COMMERCIAL-LICENSE.md` for details.

---

Made by [YashGedia](https://github.com/Yash19815)
