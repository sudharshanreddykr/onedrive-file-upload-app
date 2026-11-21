/**
 * Microsoft Graph API & Auth Configuration
 *
 * >>> HARDCODE YOUR ACCESS TOKEN HERE <<<
 *
 * When you paste your Microsoft Access Token in MICROSOFT_GRAPH_ACCESS_TOKEN:
 * 1. The app automatically turns OFF mock mode.
 * 2. It queries live: https://graph.microsoft.com/v1.0/me/drive/root/children
 * 3. Clicking "Select File" downloads the actual file via:
 *    https://graph.microsoft.com/v1.0/me/drive/items/{id}/content
 */

export const MICROSOFT_GRAPH_ACCESS_TOKEN = ""; // <-- PASTE YOUR ACCESS TOKEN HERE

export const GRAPH_ENDPOINTS = {
  ROOT_CHILDREN: "https://graph.microsoft.com/v1.0/me/drive/root/children",
  FOLDER_CHILDREN: (folderId) =>
    `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
  ITEM_CONTENT: (itemId) =>
    `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/content`,
};
