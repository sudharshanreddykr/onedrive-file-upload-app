import React, { useState } from 'react';
import LocalFileUpload from './LocalFileUpload';
import OneDriveFilePicker from './OneDriveFilePicker';
import SelectedFilesList from './SelectedFilesList';
import { Cloud } from 'lucide-react';
import { Button, Badge } from '../mudra-ui';

/**
 * Unified File Upload Wrapper Component - Mudra UI Integration
 *
 * Automatically routes to live Microsoft OneDrive file selection when the user is logged in
 * via Microsoft, or falls back to traditional local device upload for standard/local login.
 *
 * Features:
 * 1. Optional multi-select (`multiple = true/false`).
 * 2. Displays list of selected files/images after selection & close of popup.
 * 3. Eye icon (👁️) on each item to view in pop-up modal.
 * 4. In-memory processing without writing to local disk or localStorage.
 */
export default function UnifiedFileUpload({
  loginType = 'local', // 'microsoft' | 'local'
  accessToken = '',
  multiple = false,    // Optional multi-select
  accept = '*/*',
  maxSizeInBytes = 50 * 1024 * 1024,
  onFileSelect,
  onUploadSuccess,
  label = 'Document Upload',
  buttonText,
}) {
  const [isOneDriveModalOpen, setIsOneDriveModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const isMicrosoftLogin = loginType === 'microsoft';

  const handleFilesChosen = (incoming) => {
    const newItems = Array.isArray(incoming) ? incoming : [incoming];
    setSelectedFiles((prev) => {
      // If multiple, append; if single, replace
      if (multiple) {
        // Prevent duplicate IDs/names
        const existingIds = new Set(prev.map((p) => p.id || p.uploadId || p.name));
        const filteredNew = newItems.filter((n) => !existingIds.has(n.id || n.uploadId || n.name));
        const updated = [...prev, ...filteredNew];
        if (onFileSelect) onFileSelect(updated);
        return updated;
      } else {
        if (onFileSelect) onFileSelect(newItems[0]);
        return newItems;
      }
    });

    if (onUploadSuccess) {
      onUploadSuccess(incoming);
    }
  };

  const handleRemoveFile = (fileToRemove, index) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (onFileSelect) {
        onFileSelect(multiple ? updated : updated[0] || null);
      }
      return updated;
    });
  };

  return (
    <div className="unified-file-upload-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <label style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--mudra-neutral-800)' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {multiple && (
            <Badge variant="neutral">
              Multi-Select
            </Badge>
          )}
          <Badge
            variant={isMicrosoftLogin ? 'primary' : 'neutral'}
            icon={isMicrosoftLogin ? <Cloud size={13} /> : null}
          >
            {isMicrosoftLogin ? 'OneDrive Mode' : 'Local Mode'}
          </Badge>
        </div>
      </div>

      {isMicrosoftLogin ? (
        // ----------------- MICROSOFT LOGIN BRANCH (LIVE ONEDRIVE) -----------------
        <div className="onedrive-upload-container">
          <div
            className="dropzone"
            style={{
              borderColor: 'var(--mudra-primary)',
              backgroundColor: 'var(--mudra-primary-subtle)',
              cursor: 'pointer',
            }}
            onClick={() => setIsOneDriveModalOpen(true)}
          >
            <div className="dropzone-icon" style={{ color: 'var(--mudra-primary)' }}>
              <Cloud size={40} />
            </div>
            <div className="dropzone-text" style={{ color: 'var(--mudra-primary-active)' }}>
              <strong>Browse and select {multiple ? 'files' : 'a file'} from Microsoft OneDrive</strong>
            </div>
            <div className="dropzone-subtext">
              Queries live: https://graph.microsoft.com/v1.0/me/drive/root/children
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Cloud size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOneDriveModalOpen(true);
                }}
              >
                {buttonText || (multiple ? 'Open OneDrive (Multi-Select)' : 'Open OneDrive Picker')}
              </Button>
            </div>
          </div>

          {/* Mudra OneDrive Picker Modal with optional Multi-Select */}
          <OneDriveFilePicker
            isOpen={isOneDriveModalOpen}
            onClose={() => setIsOneDriveModalOpen(false)}
            accessToken={accessToken}
            multiple={multiple}
            onFileSelect={handleFilesChosen}
          />
        </div>
      ) : (
        // ----------------- LOCAL / STANDARD LOGIN BRANCH -----------------
        <LocalFileUpload
          accept={accept}
          multiple={multiple}
          maxSizeInBytes={maxSizeInBytes}
          onFileSelect={handleFilesChosen}
          buttonText={buttonText || (multiple ? 'Choose Local Files' : 'Choose Local File')}
        />
      )}

      {/* List of Selected Files/Images with Eye Icon to view in popup */}
      <SelectedFilesList
        files={selectedFiles}
        onRemoveFile={handleRemoveFile}
        title={isMicrosoftLogin ? 'Selected OneDrive Files' : 'Selected Local Files'}
      />
    </div>
  );
}
