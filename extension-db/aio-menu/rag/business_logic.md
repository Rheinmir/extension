# Business Logic

## Core Features

### 1. Tab Navigation (Dock-Style)
- **Goal**: Navigate between different tools using a macOS-style dock.
- **User Interaction & Flow**:
    1. **Locate Dock**: Look at the bottom of the extension popup window.
    2. **Hover**: Hover over icons to see them scale up (magnification effect).
    3. **Click**: Click an icon to switch to that specific tool/tab.
    4. **Active State**: The clicked icon remains highlighted (active state), and the main content area updates to show the selected tool.

### 2. JavaScript Toggle
- **Goal**: Quickly block or allow JavaScript on the current website.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Home** tab (first icon).
    2. **Check Status**: Look at the "JavaScript" toggle switch.
        - **Green/On**: JavaScript is currently allowed.
        - **Grey/Off**: JavaScript is blocked.
    3. **Toggle**: Click the switch to change the permission.
    4. **Auto-Reload**: The page will automatically reload immediately to apply the new setting.

### 3. Color Picker
- **Goal**: Pick a color from any pixel on the visible screen area.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Design** tab (second icon).
    2. **Activate**: Click the **"Pick Color"** button.
    3. **Pick**: The extension window will close, and an eyedropper cursor will appear. Click on any pixel on your screen.
    4. **Result**:
        - The Hex color code (e.g., `#FF5733`) is automatically copied to your clipboard.
        - A small notification or visual indicator confirms the selected color.

### 4. WhatFont
- **Goal**: Detect and display typography information for any element on the page.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Design** tab.
    2. **Activate**: Click the **"WhatFont"** button.
    3. **Inspect**: Move your mouse over text elements on the webpage. A tooltip will appear showing:
        - Font Family
        - Font Size & Weight
        - Line Height
        - Text Color (Hex/RGBA)
    4. **Copy**: Click on any text element to copy its font family name to the clipboard.
    5. **Exit**: Click the **"✕ Exit"** button on the floating control bar (usually at the bottom of the page) or press **ESC**.

### 5. CSS Viewer 🆕
- **Goal**: Inspect CSS properties (box model, positioning, effects) of elements.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Design** tab.
    2. **Activate**: Click the **"CSS Viewer"** button.
    3. **Inspect**: Hover over any element. A detailed panel will appear showing:
        - Box Model: Margins, Padding, Dimensions.
        - Layout: Display, Position, Z-Index.
        - Style: Font, Color, Background, Borders.
    4. **Exit**: Click the **"✕ Exit"** button on the floating control bar or press **ESC**.

### 6. Page Ruler
- **Goal**: Measure pixel dimensions and alignment of any area on the page.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Design** tab.
    2. **Activate**: Click the **"Page Ruler"** button.
    3. **Measure**:
        - Your cursor becomes a crosshair.
        - **Click and Drag** anywhere on the page to draw a measuring box.
    4. **Read Dimensions**: The width and height (px) updates in real-time near the cursor.
    5. **Copy**: Release the mouse button to finish drawing. The dimensions are automatically copied to your clipboard.
    6. **Exit**: Click the **"✕ Exit"** button on the floating control bar or press **ESC**.

### 7. Link Checker 🆕
- **Goal**: Scan the current page for broken links (404 errors).
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **SEO/Info** tab (third icon).
    2. **Activate**: Click the **"Check Links"** button.
    3. **Wait**: A progress indicator shows as the tool scans all `<a>` tags on the page.
    4. **Review Results**:
        - **Summary**: See total links, working links (Green), and broken links (Red).
        - **Details**: If broken links are found, a list appears showing the specific URLs and their status codes (e.g., 404).

### 8. Tech Stack Scanner
- **Goal**: Identify frameworks and technologies used on the current page.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **SEO/Info** tab.
    2. **Activate**: The scan usually runs automatically when you open this tab, or you can click **"Scan Tech"**.
    3. **View Results**: Badges appear for detected technologies (e.g., "React", "Tailwind CSS", "WordPress").
    4. **Empty State**: If nothing is detected, it will say "No specific technologies detected."

### 9. Window Resizer
- **Goal**: Quickly resize the browser window to standard device dimensions for responsive testing.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Device/Utils** tab (fourth icon).
    2. **Select Preset**: Click on one of the preset buttons:
        - **iPhone SE** (375x667)
        - **iPhone 14** (390x844)
        - **iPad** (768x1024)
        - **Laptop** (1280x800)
    3. **Result**: The browser window immediately resizes to the selected dimensions.

### 10. Timestamp Converter 🆕
- **Goal**: Convert between Unix timestamps and human-readable dates.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Utils** tab.
    2. **Convert to Date**:
        - Paste a Unix timestamp (seconds or milliseconds) into the input field.
        - The tool automatically displays the Date/Time in UTC and Local time.
    3. **Convert to Timestamp**:
        - Enter a date string or click **"Now"** to get the current time.
        - The Unix timestamp is displayed.
    4. **Copy**: Click the copy icon next to any result to copy it to the clipboard.

### 11. Screenshot 🆕
- **Goal**: Capture the currently visible part of the webpage.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Home** or **Utils** tab (depending on layout).
    2. **Activate**: Click the **"Screenshot"** button.
    3. **Result**: A flash effect confirms the capture, and a PNG image file (`screenshot-[timestamp].png`) is automatically downloaded to your computer.

### 12. QR Code Generator 🆕
- **Goal**: Generate a QR code for the current URL or custom text.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Utils** tab.
    2. **Generate**:
        - **Default**: It automatically loads the current tab's URL.
        - **Custom**: Type any text or URL into the input box.
    3. **View**: The QR code updates in real-time.
    4. **Download**: Click the **"Save"** button to download the QR code image.

### 13. Base64 Encoder/Decoder
- **Goal**: Encode text to Base64 or decode Base64 strings.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Utils** tab.
    2. **Encode**:
        - Type text into the "Text" field.
        - The "Base64" field automatically updates with the encoded string.
    3. **Decode**:
        - Paste a Base64 string into the "Base64" field.
        - The "Text" field automatically updates with the decoded text.
    4. **Copy**: Click the copy icon next to the result you need.

### 14. URL Parser
- **Goal**: Break down a URL into its core components.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Utils** tab.
    2. **Input**:
        - Click **"Current URL"** to parse the active tab's address.
        - OR paste a custom URL into the input field.
    3. **View Details**: The tool displays broken-down fields:
        - **Protocol** (e.g., https:)
        - **Hostname** (e.g., www.example.com)
        - **Path** (e.g., /products/item)
        - **Query Params**: Displays key-value pairs (e.g., `id = 123`).

### 15. Fake Filler
- **Goal**: Auto-fill form fields with realistic test data.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Forms** tab (if available) or look for the "Fake Filler" button.
    2. **Activate**: Click **"Fill Form"**.
    3. **Result**: The extension detects input fields on the current page (Name, Email, Phone, Address, etc.) and fills them with random, validly formatted data.

### 16. JSON Formatter
- **Goal**: Prettify and validate raw JSON strings.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Utils** tab.
    2. **Input**: Paste raw, minified, or messy JSON into the text area.
    3. **Format**: Click **"Format"**.
    4. **Result**: The JSON is indented and colored for readability. If the JSON is invalid, an error message appears.

### 17. Todo List
- **Goal**: Keep track of quick tasks or notes.
- **User Interaction & Flow**:
    1. **Access Tool**: Go to the **Home** tab (bottom section).
    2. **Add Task**: Type a task in the input field and press Enter.
    3. **Complete**: Click the checkbox next to a task to mark it as done (strikethrough).
    4. **Delete**: Click the trash icon to remove a task.
    5. **Persistence**: Your tasks are saved automatically and will be there next time you open the extension.

---

## UI/UX Design - Macism Style

### Design Principles
- **Glassmorphism**: Translucent backgrounds with backdrop blur
- **SF Pro Typography**: Apple system font stack
- **Smooth Animations**: Spring-based easing curves
- **macOS Color Palette**: Blues, greens, purples matching Sonoma/Ventura
- **Dock Navigation**: Icon-based bottom navigation with hover scale effects
- **Clean Header**: Simple title with help button (no traffic light dots)
- **Floating Exit Buttons**: Page tools show dismiss button at bottom
