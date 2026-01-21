# Rules

## Coding Standards
- **Style**: Standard Vanilla JavaScript. No framework overhead (React/Vue) is used to keep the extension lightweight.
- **CSS**: Plain CSS in `style.css`. Use class-based styling.
- **Async/Await**: Prefer `async/await` over callbacks for Chrome APIs where possible (though some older APIs or specific MV3 patterns might still use callbacks).

## Architecture Rules
- **MV3 Compliance**: Strictly adhere to Manifest V3 requirements (e.g., no remote code execution).
- **Permissions**: Only request permissions strictly needed in `manifest.json`.
- **Storage**: Use `chrome.storage.sync` for user data (todos) to ensure availability across devices.

## Special Rules -> RAG Maintenance
> [!IMPORTANT]
> **RAG Maintenance Rule**: ANY modification to the codebase (logic, architecture, workflows) MUST be accompanied by an update to the corresponding file in the `rag/` directory.

- If you add a feature, update `rag/business_logic.md`.
- If you change the build script, update `rag/workflows.md`.
- If you add a library, update `rag/tech_stack.md`.

This ensures the AI context remains the single source of truth.
