import React from "react";
import ReactDOM from "react-dom/client";
import WebviewApp from "./WebviewApp";
import "@shared/styles/index.css";

console.log("[Webview] Script loaded!");

// Acquire VS Code API once at the top level
declare global {
  interface Window {
    acquireVsCodeApi: () => any;
    vscodeApi?: any;
  }
}

let vscodeApi: any = null;
if (typeof window.acquireVsCodeApi !== "undefined") {
  console.log("[Webview] Acquiring VS Code API...");
  vscodeApi = window.acquireVsCodeApi();
  window.vscodeApi = vscodeApi; // Store globally for WebviewApp to use
  console.log("[Webview] VS Code API acquired successfully");
}

// Render the webview app
try {
  console.log("[Webview] Looking for root element...");
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("[Webview] Root element not found!");
    document.body.innerHTML =
      '<div style="color: red; padding: 20px;">Error: Root element not found!</div>';
  } else {
    console.log("[Webview] Root element found, creating React root...");
    const root = ReactDOM.createRoot(rootElement);

    console.log("[Webview] Rendering WebviewApp...");
    root.render(
      <React.StrictMode>
        <WebviewApp />
      </React.StrictMode>,
    );
    console.log("[Webview] React render called successfully");
  }
} catch (error) {
  console.error("[Webview] Error during initialization:", error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error}</div>`;
}

// Send ready message after React is rendered
if (vscodeApi) {
  console.log("[Webview] Sending ready message to extension...");
  vscodeApi.postMessage({ type: "ready" });
}
