# 🧠 Business Logic

## Core Domain: Extension Distribution
The primary purpose of the application is to act as a storefront for extensions.

### 1. Catalog Display
- **Goal**: Present available extensions to the user.
- **Logic**: 
  - Read `EXTENSIONS` list from data source.
  - Map extension IDs to visual cards.
  - Handle categories/filtering (if implemented).

### 2. Download / Installation
- **Goal**: deliver the extension "artefact" to the user.
- **Logic**:
  - The application allows users to "download" or "install" an extension.
  - **Mechanism**: The app triggers a download of the folder residing in `extension-db/[extension-id]`.
  - **Boundary**: The app initiates the transfer of files. It does *not* execute, compile, or validate the code *inside* the extension folder during this process.

### 3. User Onboarding
- **Goal**: Introduce new users to the store.
- **Logic**:
  - Check `localStorage` for `waiter_visited` flag.
  - If missing, show `OnboardingOverlay`.
  - Set flag to true after viewing.

## Excluded Logic
- **Extension Internals**: Any logic describing *how* an extension (like `aio-menu` or `fb_video_downloader`) performs its tasks (scraping, modifying DOM, API calls) is **strictly excluded** from this centralized RAG. That logic belongs to the specific extension's own documentation, if it exists.
