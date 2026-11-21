import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X, ArrowUpRight } from 'lucide-react';
import { formatBytes } from '../services/oneDriveService';
import { triggerDummyUploadApi } from '../services/uploadService';
import { Button, Badge } from '../mudra-ui';

/**
 * Local File Upload Component - Mudra UI Integration
 * Supports single and optional multi-file selection.
 */
export default function LocalFileUpload({
  accept = '*/*',
  multiple = false,
  maxSizeInBytes = 50 * 1024 * 1024,
  onFileSelect,
  onUploadSuccess,
  buttonText = 'Choose Local File',
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const processLocalFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const validFiles = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (maxSizeInBytes && file.size > maxSizeInBytes) {
        setError(`"${file.name}" exceeds limit (${formatBytes(maxSizeInBytes)}).`);
        return;
      }
      validFiles.push(file);
    }

    // Automatically trigger dummy upload API for each local file
    setIsUploading(true);
    setUploadPercent(0);
    const uploadedResults = [];

    try {
      const total = validFiles.length;
      for (let i = 0; i < total; i++) {
        const file = validFiles[i];
        const res = await triggerDummyUploadApi(
          file,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            source: 'local',
          },
          (pct) => {
            const basePct = Math.round((i / total) * 100);
            const stepPct = Math.round((pct / 100) * (100 / total));
            setUploadPercent(Math.min(100, basePct + stepPct));
          }
        );

        uploadedResults.push({
          source: 'local',
          file: file,
          inMemoryBlob: file, // File is an in-memory Blob instance
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: file.lastModified,
          uploadResult: res,
          uploadId: res.uploadId,
          previewUrl: res.previewUrl,
          isImage: res.isImage,
          uploadedAt: res.uploadedAt,
        });
      }

      setUploadPercent(100);

      if (onUploadSuccess) {
        onUploadSuccess(multiple ? uploadedResults : uploadedResults[0]);
      }
      if (onFileSelect) {
        onFileSelect(multiple ? uploadedResults : uploadedResults[0]);
      }
    } catch (err) {
      setError(err.message || 'Local upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processLocalFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processLocalFiles(files);
    }
  };

  return (
    <div className="local-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        data-testid="local-file-input"
      />

      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon">
          <UploadCloud size={38} strokeWidth={1.75} />
        </div>
        <div className="dropzone-text">
          <strong>Click to upload</strong> or drag and drop files from your computer
        </div>
        <div className="dropzone-subtext">
          Accepted types: {accept === '*/*' ? 'All files supported' : accept} {multiple && '(Multiple files supported)'}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Button
            variant="secondary"
            size="sm"
            loading={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {isUploading ? `Processing (${uploadPercent}%)` : buttonText}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--mudra-danger)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Progress Bar when uploading */}
      {isUploading && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--mudra-neutral-700)', marginBottom: '0.35rem' }}>
            <span>Processing local file stream into memory...</span>
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
    </div>
  );
}
