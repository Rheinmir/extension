# 🗄️ Database Structure

## 1. Database Overview
The application uses a static JavaScript file as a lightweight database to store metadata about available extensions.

**File**: `src/data/extensions.jsx` (or `data/extensions.jsx`)

## 2. Structure

The data is exported as an array of objects constant named `EXTENSIONS`.

### Extension Object Schema

| Field | Type | Description |
| --- | --- | --- |
| `id` | String | Unique identifier for the extension (e.g., 'aio-menu') |
| `name` | String | Display name of the extension |
| `description` | String | Short description |
| `longDescription` | String | Detailed description |
| `icon` | Component/String | Icon component or path |
| `version` | String | Current version string |
| `category` | String | Category (e.g., 'Productivity', 'Social') |
| `status` | String | 'available', 'coming_soon', etc. |
| `path` | String | Relative path to the extension folder in `extension-db` |

> **Note**: This "database" does not store the user's data or state, which is handled via local state or localStorage (e.g., `waiter_visited`).
