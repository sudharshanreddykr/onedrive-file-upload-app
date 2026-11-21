/**
 * Microsoft OneDrive Graph API Service
 * Exclusively communicates with the live Microsoft Graph API.
 */

import { MICROSOFT_GRAPH_ACCESS_TOKEN, GRAPH_ENDPOINTS } from '../config/authConfig';

/**
 * Fetches children from OneDrive (Microsoft Graph API)
 * @param {string | null} folderId - null for root, or specific folder item ID
 * @param {string} accessToken - Bearer token for Microsoft Graph
 * @returns {Promise<Array>} Array of drive items from live API
 */
export async function fetchOneDriveChildren(folderId = null, accessToken = '') {
  const activeToken = (accessToken || MICROSOFT_GRAPH_ACCESS_TOKEN || '').trim();

  if (!activeToken) {
    throw new Error('Microsoft Graph Access Token is missing. Please provide a token in src/config/authConfig.js or in the input field above.');
  }

  // Construct Microsoft Graph endpoint
  const endpoint = folderId
    ? GRAPH_ENDPOINTS.FOLDER_CHILDREN(folderId)
    : GRAPH_ENDPOINTS.ROOT_CHILDREN;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errJson = await response.json();
      errorDetails = errJson?.error?.message || response.statusText;
    } catch {
      errorDetails = response.statusText;
    }
    throw new Error(`Graph API error (${response.status}): ${errorDetails}`);
  }

  const data = await response.json();
  return data.value || [];
}

/**
 * Utility to format byte size nicely
 */
export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
