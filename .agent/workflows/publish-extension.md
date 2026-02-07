---
description: How to publish the VS Code Extension to the Marketplace
---

# Publishing the Function Visualizer Extension

This workflow guides you through the process of publishing your extension to the Visual Studio Code Marketplace.

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [VS Code](https://code.visualstudio.com/) installed.
- A Microsoft Account.

## Step 1: Create a Publisher

1.  Go to the [Visual Studio Code Marketplace management page](https://marketplace.visualstudio.com/manage).
2.  Sign in with your Microsoft Account.
3.  Click **"Create publisher"**.
4.  Enter a unique **Publisher ID** (e.g., `Yash19815`).
    - **Note**: This ID must match the `"publisher"` field in your `package.json`.
5.  Enter a **Display Name**.

## Step 2: Get a Personal Access Token (PAT)

1.  Go to your [Azure DevOps Organization](https://dev.azure.com/).
    - If you don't have one, create a new organization (it's free).
2.  Open your **User Settings** (icon next to your profile picture) > **Personal access tokens**.
3.  Click **"New Token"**.
4.  Configure the token:
    - **Name**: `vscode-extension-publish` (or similar).
    - **Organization**: Select "All accessible organizations".
    - **Scopes**: Select **"Custom defined"**.
    - Scroll to the bottom and find **Marketplace**.
    - Check **"Acquire"** and **"Manage"**.
5.  Click **"Create"**.
6.  **Copy the token immediately**. You won't see it again!

## Step 3: Login with vsce

Open your terminal in the project root and run:

```bash
npx vsce login Yash19815
```

(Replace `Yash19815` with your actual publisher ID if different).

When prompted, paste your **Personal Access Token**.

## Step 4: Publish

To publish a new version:

1.  **Update Version**:
    If you have made multiple changes, update the version in `package.json` (e.g., `0.1.0` -> `0.1.1`):

    ```bash
    npm version patch
    ```

2.  **Publish**:
    Run the following command. It will rebuild the project and upload it:

    ```bash
    npx vsce publish
    ```

    - This command runs `prepublish` scripts automatically (`npm run build:extension`).

## Alternative: Manual Upload

If you prefer to upload manually via the website:

1.  **Package the Extension**:

    ```bash
    npm run package
    ```

    This creates a `.vsix` file (e.g., `function-visualizer-vscode-0.1.0.vsix`).

2.  **Upload**:
    - Go to the [Marketplace Management Page](https://marketplace.visualstudio.com/manage).
    - Select your publisher.
    - Click **"New Extension"** > **"Visual Studio Code"**.
    - Upload the `.vsix` file.

## Troubleshooting

- **"Repo not clean"**: Commit your changes before publishing.
- **"Publisher not found"**: Ensure the ID in `package.json` matches your Marketplace publisher ID exactly.
- **"Unauthorized"**: Your PAT might be expired or missing the `Marketplace (manage)` scope. Regenerate it.
