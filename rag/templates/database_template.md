# 🗄️ Database/Data Template

Since this project uses a static data file (`src/data/extensions.jsx`) as its database, use this template when adding a new extension to the catalog.

## Extension Entry

Add this object to the `EXTENSIONS` array in `src/data/extensions.jsx`:

```javascript
{
  id: "extension-id-slug",
  name: "Extension Name",
  description: "Short description for the card view.",
  longDescription: "Longer description for the details modal. Can include usage instructions.",
  icon: <IconComponent className="w-8 h-8" />, // Import icon from lucide-react
  version: "1.0.0",
  category: "Category Name", // e.g., 'Productivity', 'DevTool'
  status: "available", // or 'coming_soon'
  path: "extension-db/extension-folder-name", // Relative path to external db
},
```

## Checklist
- [ ] Unique `id`
- [ ] Icon imported
- [ ] Path exists in `extension-db/` (if status is available)
