# Workflows

## Development

### Building & Running
We use a custom shell script to facilitate safe development on macOS.

**Command**: `./start_dev.sh`

**Process**:
1.  **Cleanup**: Removes previous debug and profile directories (`~/Downloads/hello_extension_debug`).
2.  **Prepare**: Copies current extension files to the debug directory.
3.  **Sanitize**: Removes quarantine attributes (`xattr -cr`) to prevent macOS security blocks.
4.  **Launch**: Starts a **new instance** of Google Chrome with:
    - The extension loaded (`--load-extension`).
    - A dedicated user data directory (`--user-data-dir`) to keep your main profile clean.
    - Flags to skip first-run checks.

### Testing
- **Popup Logic**: Open the extension popup by clicking the icon.
- **Content Scripts**: Navigate to any webpage and use features like "Scan Tech Stack".
- **Logs**:
    - Popup logs: Right-click popup -> Inspect -> Console.
    - Content script logs: Inspect the web page -> Console.

## Deployment
1.  Bump version in `manifest.json`.
2.  Zip the extension folder (excluding `.git`, `*.sh`, `rag/`).
3.  Upload to Chrome Web Store Developer Dashboard.
