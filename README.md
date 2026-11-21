# Unified File Upload & Microsoft OneDrive Integration (Mudra UI)

A production-ready React application showcasing:
1. **Live Microsoft OneDrive Picker Component**:
   - Strictly queries the live Microsoft Graph API: `https://graph.microsoft.com/v1.0/me/drive/root/children`
   - Dynamically navigates child folders: `https://graph.microsoft.com/v1.0/me/drive/items/{folderId}/children`
   - Mudra UI `<Modal>`, `<Breadcrumbs>`, `<Button>`, and `<Spinner>`.
2. **In-Memory Download & Dummy Upload Pipeline**:
   - On clicking **"Select File"**, the live file stream is fetched into an in-memory JavaScript `Blob` variable (no write to local device disk or browser `localStorage`).
   - Streams the in-memory variable to a dummy upload API (`POST /api/documents/upload`).
3. **Uploaded Files List & Viewer**:
   - Shows completed uploads.
   - Click **"View"** to inspect the file directly from the in-memory `Blob` variable inside a Mudra `<Modal>`.
4. **Local File Upload Component**:
   - Drag-and-drop & native file input for standard/local login.
5. **Unified Wrapper (`UnifiedFileUpload`)**:
   - Automatically renders OneDrive for Microsoft login or Local file upload for standard login.

---

## Setting Your Microsoft Access Token

Open [`src/config/authConfig.js`](src/config/authConfig.js) and paste your Bearer token:

```javascript
export const MICROSOFT_GRAPH_ACCESS_TOKEN = "PASTE_YOUR_ACCESS_TOKEN_HERE";
```

---

## Running the App

```bash
cd onedrive-file-upload-app
npm install
npm run dev
```

Visit `http://localhost:5173`.
