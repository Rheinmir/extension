# 🏛️ Architecture & System Context
## Project Name
Waiter (Extension Store)

## System Context
The "Waiter" application is a React-based "store" or "launchpad" that allows users to browse and download browser extensions. It acts as a catalog and distribution mechanism.

**Crucial Boundary:** This application treats the extensions located in `extension-db/` as static assets/packages. **It does not concern itself with the internal business logic, code structure, or specific implementation of those extensions.** Its only responsibility regarding extensions is to list them and facilitate their download/installation.

## High-Level Diagram
```mermaid
graph TD
    User[User] -->|Browses| Client[React Client (Waiter)]
    Client -->|Reads Metadata| ExtensionData[data/extensions.jsx]
    Client -->|Downloads| ExtensionFiles[extension-db/ (File Storage)]
```

## Directory Structure

* **`src/`**: Core source code for the Waiter functionality (UI, Download logic).
* **`data/`**: Contains metadata about the extensions (`extensions.jsx`).
* **`rag/`**: AI context and documentation (Scope: Waiter App only).
* **`extension-db/`**: Storage directory for extension packages. Content within this folder is **out of scope** for this RAG context, except as file targets for download.
