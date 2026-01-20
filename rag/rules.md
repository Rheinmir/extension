# 📜 Development Rules

## AI Agent Guidelines

1. **Session Start**: At the beginning of every session, read `rag/0-INDEX.md` and `rag/rules.md` first.
2. **Scope Boundary**: Do NOT analyze or modify code inside `extension-db/` unless explicitly instructed to perform file system operations (like moving/zipping) relevant to the *distribution* of those extensions. Do NOT treat `extension-db` code as part of the Waiter app's codebase.
3. **Standard Alignment**: Ensure all generated code follows the defined naming and architectural patterns.

## Coding Standards

* **Style**: Functional Components with Hooks.
* **Naming**: PascalCase for components, camelCase for functions/variables.
* **Styling**: Use Tailwind CSS utility classes.
