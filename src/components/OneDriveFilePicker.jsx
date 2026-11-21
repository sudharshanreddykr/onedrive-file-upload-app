import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Cloud,
  CheckCircle2,
  FolderOpen,
  CheckSquare,
  Square
} from 'lucide-react';
import { fetchOneDriveChildren, formatBytes } from '../services/oneDriveService';
import { downloadFileFromOneDrive, triggerDummyUploadApi } from '../services/uploadService';
import { Modal, Breadcrumbs, Button, Spinner, Badge } from '../mudra-ui';

function getFileIcon(item) {
  if (item.folder) {
    return <Folder size={20} color="var(--mudra-primary)" fill="var(--mudra-primary-subtle)" />;
  }
  const name = item.name.toLowerCase();
  const mime = item.file?.mimeType || '';

  if (mime.includes('image') || /\.(png|jpe?g|svg|gif|webp)$/.test(name)) {
    return <FileImage size={20} color="#0ea5e9" />;
  }
  if (mime.includes('spreadsheet') || /\.(xlsx|xls|csv)$/.test(name)) {
    return <FileSpreadsheet size={20} color="var(--mudra-success)" />;
  }
  if (mime.includes('pdf') || /\.(pdf|docx?|txt)$/.test(name)) {
    return <FileText size={20} color="var(--mudra-danger)" />;
  }
  if (/\.(json|js|jsx|ts|tsx|html|css)$/.test(name)) {
    return <FileCode size={20} color="#8b5cf6" />;
  }
  return <FileIcon size={20} color="var(--mudra-neutral-500)" />;
}

export default function OneDriveFilePicker({
  isOpen,
  onClose,
  accessToken = '',
  multiple = false, // Optional multi-select flag!
  onFileSelect,
  onUploadSuccess,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected items: array of items
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Download & Upload state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);

  // Breadcrumbs stack
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'OneDrive Root' }]);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  const loadItems = async (folderId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOneDriveChildren(folderId, accessToken);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch items from Microsoft OneDrive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadItems(currentFolder.id);
      setIsProcessing(false);
      setUploadPercent(0);
      setProcessStage('');
      setSelectedItems([]);
    }
  }, [isOpen, currentFolder.id, accessToken]);

  if (!isOpen) return null;

  const handleItemClick = (item) => {
    if (isProcessing) return;

    if (item.folder) {
      // Navigate into child folder
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
      setSearchQuery('');
    } else {
      // Toggle or select file
      if (multiple) {
        setSelectedItems((prev) => {
          const exists = prev.some((i) => i.id === item.id);
          if (exists) {
            return prev.filter((i) => i.id !== item.id);
          } else {
            return [...prev, item];
          }
        });
      } else {
        setSelectedItems([item]);
      }
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (isProcessing) return;
    const updated = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(updated);
    setSearchQuery('');
  };

  const handleSelectAllInCurrentFolder = () => {
    const fileItems = filteredItems.filter((i) => !i.folder);
    if (fileItems.length === 0) return;

    const allSelected = fileItems.every((f) => selectedItems.some((s) => s.id === f.id));
    if (allSelected) {
      // Deselect them
      setSelectedItems((prev) => prev.filter((s) => !fileItems.some((f) => f.id === s.id)));
    } else {
      // Add all
      const newItems = fileItems.filter((f) => !selectedItems.some((s) => s.id === f.id));
      setSelectedItems((prev) => [...prev, ...newItems]);
    }
  };

  /**
   * On click of "Select File(s)":
   * 1. Fetches file bytes for each selected file into in-memory JS Blob variables.
   *    (Zero write to local device disk or browser localStorage).
   * 2. Passes the in-memory variables to triggerDummyUploadApi.
   * 3. Emits upload results to parent and closes OneDrive dialog.
   */
  const handleConfirmSelection = async () => {
    if (selectedItems.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    const total = selectedItems.length;
    const processedFiles = [];

    try {
      for (let i = 0; i < total; i++) {
        const item = selectedItems[i];
        setProcessStage(`Fetching "${item.name}" into in-memory variable (${i + 1}/${total})...`);
        setUploadPercent(Math.round(((i * 2 + 1) / (total * 2)) * 100));

        // 1. Download into in-memory Blob variable (no disk or localStorage)
        const inMemoryFileBlob = await downloadFileFromOneDrive(item, accessToken);

        // Expose in-memory blob to window
        if (typeof window !== 'undefined') {
          window.__latestDownloadedBlob = inMemoryFileBlob;
        }

        // 2. Stream in-memory blob directly to Dummy Upload API
        setProcessStage(`Uploading "${item.name}" to API (${i + 1}/${total})...`);
        const uploadResult = await triggerDummyUploadApi(
          inMemoryFileBlob,
          {
            name: item.name,
            size: item.size || inMemoryFileBlob.size,
            type: item.file?.mimeType || inMemoryFileBlob.type,
            source: 'onedrive',
            id: item.id,
          },
          (pct) => {
            const basePct = Math.round(((i * 2 + 1) / (total * 2)) * 100);
            const stepPct = Math.round((pct / 100) * (50 / total));
            setUploadPercent(Math.min(100, basePct + stepPct));
          }
        );

        processedFiles.push({
          source: 'onedrive',
          id: item.id,
          name: item.name,
          size: item.size || inMemoryFileBlob.size,
          type: item.file?.mimeType || inMemoryFileBlob.type || 'application/octet-stream',
          downloadUrl: item['@microsoft.graph.downloadUrl'] || '',
          inMemoryBlob: inMemoryFileBlob,
          uploadResult: uploadResult,
          uploadId: uploadResult.uploadId,
          previewUrl: uploadResult.previewUrl,
          isImage: uploadResult.isImage,
          uploadedAt: uploadResult.uploadedAt,
        });
      }

      setUploadPercent(100);

      // Notify parent
      if (onUploadSuccess) {
        onUploadSuccess(multiple ? processedFiles : processedFiles[0]);
      }
      if (onFileSelect) {
        onFileSelect(multiple ? processedFiles : processedFiles[0]);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed during memory retrieval or upload process.');
      setIsProcessing(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folderFileCount = filteredItems.filter((i) => !i.folder).length;

  const mudraBreadcrumbItems = breadcrumbs.map((crumb, idx) => ({
    id: crumb.id || 'root',
    label: crumb.name,
    onClick: idx < breadcrumbs.length - 1 ? () => handleBreadcrumbClick(idx) : undefined,
  }));

  const modalFooter = (
    <>
      <div style={{ fontSize: '0.85rem', color: 'var(--mudra-neutral-600)' }}>
        {isProcessing ? (
          <span style={{ color: 'var(--mudra-primary)', fontWeight: 500 }}>
            {processStage} ({uploadPercent}%)
          </span>
        ) : selectedItems.length > 0 ? (
          <span>
            Selected:{' '}
            <strong style={{ color: 'var(--mudra-neutral-900)' }}>
              {selectedItems.length} {selectedItems.length === 1 ? 'file' : 'files'}
            </strong>{' '}
            ({formatBytes(selectedItems.reduce((acc, curr) => acc + (curr.size || 0), 0))})
          </span>
        ) : (
          <span>Choose {multiple ? 'files' : 'a file'} to select</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isProcessing}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={selectedItems.length === 0}
          loading={isProcessing}
          onClick={handleConfirmSelection}
        >
          {isProcessing
            ? `Uploading (${uploadPercent}%)`
            : multiple && selectedItems.length > 1
            ? `Select (${selectedItems.length}) Files`
            : 'Select File'}
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title={multiple ? 'Select Files from Microsoft OneDrive' : 'Select File from Microsoft OneDrive'}
      icon={<Cloud size={22} color="var(--mudra-primary)" />}
      footer={modalFooter}
    >
      {/* Header controls: Breadcrumbs & Multi-select indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Breadcrumbs items={mudraBreadcrumbItems} />
        {multiple && (
          <Badge variant="primary">
            Multi-Select Active
          </Badge>
        )}
      </div>

      {/* Progress Bar when processing */}
      {isProcessing && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--mudra-neutral-700)', marginBottom: '0.35rem' }}>
            <span>{processStage}</span>
            <strong>{uploadPercent}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--mudra-neutral-200)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${uploadPercent}%`,
                height: '100%',
                background: 'var(--mudra-primary)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Search and multi-select actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <input
          type="text"
          placeholder="Filter files in current folder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isProcessing}
          className="input-text"
          style={{ fontSize: '0.85rem' }}
        />
        {multiple && folderFileCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={handleSelectAllInCurrentFolder}
            title="Toggle select all in folder"
          >
            Select All
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={isProcessing}
          onClick={() => loadItems(currentFolder.id)}
          title="Refresh items"
          icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}
        />
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--mudra-danger-subtle)',
            border: '1px solid var(--mudra-danger-border)',
            borderRadius: 'var(--mudra-radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: 'var(--mudra-danger)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Error connecting to Microsoft Graph:</strong>
            <div>{error}</div>
            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#991b1b' }}>
              💡 Ensure your token is valid with <code>Files.Read</code> or <code>Files.Read.All</code> permission.
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--mudra-neutral-500)' }}>
          <Spinner size="lg" />
          <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading OneDrive items...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--mudra-neutral-500)' }}>
          <FolderOpen size={36} color="var(--mudra-neutral-400)" style={{ marginBottom: '0.5rem' }} />
          <p>No files or folders found here.</p>
        </div>
      ) : (
        <div className="file-list">
          {filteredItems.map((item) => {
            const isFolder = Boolean(item.folder);
            const isSelected = selectedItems.some((s) => s.id === item.id);

            return (
              <div
                key={item.id}
                className={`file-item ${isSelected ? 'selected' : ''}`}
                style={isProcessing ? { pointerEvents: 'none', opacity: 0.7 } : {}}
                onClick={() => handleItemClick(item)}
              >
                <div className="file-item-left">
                  {/* Multi-select Checkbox indicator for files */}
                  {!isFolder && multiple && (
                    <span style={{ color: isSelected ? 'var(--mudra-primary)' : 'var(--mudra-neutral-400)', display: 'flex' }}>
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </span>
                  )}

                  {getFileIcon(item)}
                  <span className="file-item-name" title={item.name}>
                    {item.name}
                  </span>
                </div>

                <div className="file-item-right">
                  {isFolder ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--mudra-neutral-500)' }}>
                      {item.folder.childCount ?? 0} items
                    </span>
                  ) : (
                    <span>{formatBytes(item.size)}</span>
                  )}
                  {isFolder ? (
                    <ChevronRight size={16} color="var(--mudra-neutral-400)" />
                  ) : (
                    !multiple && isSelected && <CheckCircle2 size={16} color="var(--mudra-primary)" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
