import * as vscode from "vscode";
import * as path from "path";
import { parseCode } from "@shared/utils/codeParser";

/**
 * Manages the webview panel for the function visualizer
 * Implements singleton pattern to reuse existing panel
 */
export class VisualizerPanel {
  public static currentPanel: VisualizerPanel | undefined;
  private static readonly viewType = "functionVisualizer";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  /**
   * Creates or shows the visualizer panel
   * @param extensionUri - URI of the extension directory
   * @param document - The document to visualize
   * @param codeOverride - Optional code override (for selection visualization)
   */
  public static createOrShow(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument,
    codeOverride?: string,
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (VisualizerPanel.currentPanel) {
      VisualizerPanel.currentPanel._panel.reveal(column);
      VisualizerPanel.currentPanel.update(document, codeOverride);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      VisualizerPanel.viewType,
      "Function Visualizer",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "dist"),
          vscode.Uri.joinPath(extensionUri, "build"),
        ],
      },
    );

    VisualizerPanel.currentPanel = new VisualizerPanel(
      panel,
      extensionUri,
      document,
      codeOverride,
    );
  }

  /**
   * Private constructor (singleton pattern)
   */
  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument,
    codeOverride?: string,
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set initial HTML content
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Update with the document content
    this.update(document, codeOverride);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case "ready":
            // Webview is ready, resend data
            this.update(document, codeOverride);
            break;
          case "export":
            this.handleExport(message.data);
            break;
          case "error":
            vscode.window.showErrorMessage(
              `Visualizer Error: ${message.message}`,
            );
            break;
        }
      },
      null,
      this._disposables,
    );
  }

  /**
   * Updates the webview with new content
   */
  private update(document: vscode.TextDocument, codeOverride?: string) {
    const code = codeOverride || document.getText();
    const language = this.mapLanguageId(document.languageId);

    try {
      const parsed = parseCode(code, language);

      // Send parsed data to webview
      this._panel.webview.postMessage({
        type: "update",
        data: {
          parsed,
          language,
          fileName: path.basename(document.fileName),
        },
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to parse code: ${error}`);
      console.error("Parse error:", error);
    }
  }

  /**
   * Maps VS Code language IDs to parser language types
   */
  private mapLanguageId(
    languageId: string,
  ): "javascript" | "typescript" | "python" | "java" {
    const mapping: Record<
      string,
      "javascript" | "typescript" | "python" | "java"
    > = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      java: "java",
      javascriptreact: "javascript",
      typescriptreact: "typescript",
    };
    return mapping[languageId] || "javascript";
  }

  /**
   * Generates the HTML content for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for the webview resources
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js"),
    );

    // Load ReactFlow CSS
    const reactFlowCssPath = path.join(
      this._extensionUri.fsPath,
      "extension",
      "resources",
      "reactflow.css",
    );
    let reactFlowCss = "";
    try {
      reactFlowCss = require("fs").readFileSync(reactFlowCssPath, "utf8");
      console.log(
        "[VisualizerPanel] Loaded ReactFlow CSS, length:",
        reactFlowCss.length,
      );
    } catch (e) {
      console.error("[VisualizerPanel] Failed to load ReactFlow CSS:", e);
      console.error("[VisualizerPanel] Attempted path:", reactFlowCssPath);
    }

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:; font-src ${webview.cspSource}; connect-src ${webview.cspSource}; worker-src blob:;">
  <title>Function Visualizer</title>
  <style>
    ${reactFlowCss}
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * Handles export requests from the webview
   */
  private async handleExport(data: { type: "json" | "jpeg"; content: any }) {
    try {
      if (data.type === "json") {
        const uri = await vscode.window.showSaveDialog({
          filters: { JSON: ["json"] },
          defaultUri: vscode.Uri.file("function-graph.json"),
        });

        if (uri) {
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(JSON.stringify(data.content, null, 2)),
          );
          vscode.window.showInformationMessage(`Exported to ${uri.fsPath}`);
        }
      } else if (data.type === "jpeg") {
        const uri = await vscode.window.showSaveDialog({
          filters: { JPEG: ["jpg", "jpeg"] },
          defaultUri: vscode.Uri.file("function-graph.jpg"),
        });

        if (uri) {
          // data.content should be a base64 string
          const base64Data = data.content.replace(
            /^data:image\/\w+;base64,/,
            "",
          );
          const buffer = Buffer.from(base64Data, "base64");
          await vscode.workspace.fs.writeFile(uri, buffer);
          vscode.window.showInformationMessage(`Exported to ${uri.fsPath}`);
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Export failed: ${error}`);
    }
  }

  /**
   * Disposes the panel and cleans up resources
   */
  public dispose() {
    VisualizerPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}

/**
 * Generates a random nonce for CSP
 */
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
