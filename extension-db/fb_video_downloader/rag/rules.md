# Rules

## Coding Standards
- **Style**: Standard Vanilla JavaScript (ES6+). No framework overhead.
- **CSS**: Plain CSS in `style.css`. Use CSS variables for theming.
- **Async/Await**: Prefer `async/await` for Chrome APIs and fetch calls.
- **Error Handling**: Always wrap API calls in try/catch with user-friendly error messages.

## Architecture Rules
- **MV3 Compliance**: Strictly adhere to Manifest V3 requirements.
- **MAIN World**: Use `world: "MAIN"` for video_extractor.js to access React internals.
- **Permissions**: Only request permissions strictly needed:
  - `activeTab`, `scripting`, `downloads`, `cookies`, `tabs`
- **Host Permissions**: Limited to Facebook domains only:
  - `*://*.facebook.com/*`, `*://*.fbcdn.net/*`

## Facebook-Specific Rules
- **Cookie Access**: Requires `c_user` and `xs` cookies for Graph API auth.
- **Token Extraction**: Access token retrieved from business.facebook.com page source.
- **Rate Limits**: Avoid rapid successive API calls.

## Special Rules -> RAG Maintenance
> [!IMPORTANT]
> **RAG Maintenance Rule**: ANY modification to the codebase MUST be accompanied by an update to the corresponding file in the `rag/` directory.

- If you add a feature, update `rag/business_logic.md`.
- If you change extraction methods, update `rag/architecture.md`.
- If you add an API, update `rag/tech_stack.md`.

This ensures the AI context remains the single source of truth.
