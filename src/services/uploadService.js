/**
 * Upload & File Download Service
 *
 * NOTE: "Download" here strictly means fetching the file bytes over HTTP into an
 * IN-MEMORY JavaScript variable (Blob).
 * It is NOT saved to the local disk, Downloads folder, or localStorage.
 */

import { MICROSOFT_GRAPH_ACCESS_TOKEN, GRAPH_ENDPOINTS } from '../config/authConfig';

/**
 * Downloads a file from live Microsoft OneDrive into an IN-MEMORY JS variable (Blob).
 * DOES NOT save to local device disk or browser localStorage.
 *
 * @param {object} item - OneDrive file item metadata
 * @param {string} accessToken - Microsoft Graph bearer token
 * @returns {Promise<Blob>} The in-memory Blob variable
 */
export async function downloadFileFromOneDrive(item, accessToken = '') {
  const activeToken = (accessToken || MICROSOFT_GRAPH_ACCESS_TOKEN || '').trim();

  if (!activeToken) {
    throw new Error('Microsoft Graph Access Token is missing. Cannot fetch file.');
  }

  // 1. Try Microsoft Graph /content endpoint with Authorization header
  if (item.id) {
    try {
      const contentEndpoint = GRAPH_ENDPOINTS.ITEM_CONTENT(item.id);
      const res = await fetch(contentEndpoint, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        return await res.blob();
      }
    } catch (err) {
      console.warn('Could not fetch via item content endpoint, trying downloadUrl', err);
    }
  }

  // 2. Try pre-authenticated downloadUrl if provided by Graph
  const downloadUrl = item['@microsoft.graph.downloadUrl'] || item.downloadUrl;
  if (downloadUrl) {
    const response = await fetch(downloadUrl);
    if (response.ok) {
      return await response.blob();
    }
  }

  throw new Error(`Failed to download live file "${item.name}" from Microsoft OneDrive.`);
}

/**
 * Dummy Upload API
 * Takes the in-memory Blob variable and streams it directly to the upload API endpoint.
 *
 * @param {Blob | File} inMemoryBlob - The file data stored in memory
 * @param {object} metadata - File metadata
 * @param {function} onProgress - Progress reporting callback
 */
export async function triggerDummyUploadApi(inMemoryBlob, metadata, onProgress = () => {}) {
  // Step 1: Upload initialized from memory
  onProgress(20);
  await new Promise((r) => setTimeout(r, 200));

  // Step 2: Uploading binary buffer from RAM
  onProgress(55);
  await new Promise((r) => setTimeout(r, 250));

  // Step 3: Server processing payload
  onProgress(90);
  await new Promise((r) => setTimeout(r, 200));

  // Step 4: Finished
  onProgress(100);
  await new Promise((r) => setTimeout(r, 100));

  // Create an in-memory Object URL solely for viewing inside the browser window
  const previewUrl = URL.createObjectURL(inMemoryBlob);
  const isImage = (metadata.type || '').startsWith('image/') || /\.(png|jpe?g|svg|webp|gif)$/i.test(metadata.name);

  return {
    uploadId: 'upl_' + Math.random().toString(36).substring(2, 10),
    name: metadata.name,
    size: metadata.size || inMemoryBlob.size || 0,
    type: metadata.type || inMemoryBlob.type || 'application/octet-stream',
    source: metadata.source || 'local',
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    previewUrl: previewUrl,
    inMemoryBlob: inMemoryBlob,
    isImage: isImage,
    serverStatus: 200,
    serverMessage: 'File streamed from memory to dummy upload API (POST /api/documents/upload)',
  };
}
