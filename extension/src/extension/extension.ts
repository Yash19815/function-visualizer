import * as vscode from "vscode";
import { VisualizerPanel } from "./VisualizerPanel";

/**
 * Extension activation function
 * Called when the extension is activated (first command execution)
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Function Visualizer extension is now active");

  // Register command to visualize the entire active file
  const visualizeFileCommand = vscode.commands.registerCommand(
    "function-visualizer.visualizeFile",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor found. Please open a file first.",
        );
        return;
      }

      // Check if language is supported
      const supportedLanguages = [
        "javascript",
        "typescript",
        "python",
        "java",
        "javascriptreact",
        "typescriptreact",
      ];
      if (!supportedLanguages.includes(editor.document.languageId)) {
        vscode.window.showWarningMessage(
          `Language "${editor.document.languageId}" is not currently supported. Supported languages: JavaScript, TypeScript, Python, Java.`,
        );
        return;
      }

      VisualizerPanel.createOrShow(context.extensionUri, editor.document);
    },
  );

  // Register command to visualize only selected code
  const visualizeSelectionCommand = vscode.commands.registerCommand(
    "function-visualizer.visualizeSelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor found. Please open a file first.",
        );
        return;
      }

      if (editor.selection.isEmpty) {
        vscode.window.showInformationMessage(
          "Please select some code to visualize.",
        );
        return;
      }

      const selectedText = editor.document.getText(editor.selection);
      VisualizerPanel.createOrShow(
        context.extensionUri,
        editor.document,
        selectedText,
      );
    },
  );

  context.subscriptions.push(visualizeFileCommand, visualizeSelectionCommand);
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log("Function Visualizer extension is now deactivated");
}
