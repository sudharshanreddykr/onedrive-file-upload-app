import React, { useState } from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  Eye,
  Trash2,
  Cloud,
  HardDrive,
  CheckCircle2,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { formatBytes } from '../services/oneDriveService';
import { Card, Button, Badge, Modal } from '../mudra-ui';

function getFileIcon(fileName, mimeType = '') {
  const name = (fileName || '').toLowerCase();
  const mime = mimeType.toLowerCase();

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

export default function UploadedFilesList({
  uploadedFiles = [],
  onRemoveFile,
  onClearAll,
}) {
  const [viewingFile, setViewingFile] = useState(null);
  const [textContent, setTextContent] = useState('');

  const handleOpenView = async (file) => {
    setViewingFile(file);
    setTextContent('');

    // Expose in-memory variable to window for developer inspection in DevTools
    if (typeof window !== 'undefined') {
      window.__activeFileBlob = file.inMemoryBlob;
      console.log('📌 In-Memory File Blob assigned to window.__activeFileBlob:', file.inMemoryBlob);
    }

    // If it's a text/document blob, read directly from the in-memory blob
    if (!file.isImage && file.inMemoryBlob) {
      try {
        const text = await file.inMemoryBlob.text();
        setTextContent(text);
      } catch (err) {
        setTextContent('Unable to read in-memory document text.');
      }
    } else if (!file.isImage && file.previewUrl) {
      try {
        const res = await fetch(file.previewUrl);
        const text = await res.text();
        setTextContent(text);
      } catch (err) {
        setTextContent('Unable to read in-memory document text.');
      }
    }
  };

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <Card
        title={`Uploaded Files (${uploadedFiles.length})`}
        subtitle="Files held in in-memory variables and streamed to Dummy Upload API. No files saved to local device disk or localStorage."
        icon={<CheckCircle2 size={20} color="var(--mudra-success)" />}
        action={
          uploadedFiles.length > 1 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear Memory
            </Button>
          )
        }
      >
        <div className="file-list">
          {uploadedFiles.map((file) => {
            const isOneDrive = file.source === 'onedrive';
            return (
              <div key={file.uploadId} className="file-item" style={{ cursor: 'default' }}>
                <div className="file-item-left">
                  {getFileIcon(file.name, file.type)}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--mudra-neutral-900)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--mudra-neutral-500)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                      <span>{formatBytes(file.size)}</span>
                      <span>&bull;</span>
                      <span>Processed at {file.uploadedAt}</span>
                      <span>&bull;</span>
                      <span style={{ color: 'var(--mudra-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Cpu size={12} /> Stored in RAM Variable
                      </span>
                    </div>
                  </div>
                </div>

                <div className="file-item-right" style={{ gap: '0.5rem' }}>
                  <Badge
                    variant={isOneDrive ? 'primary' : 'neutral'}
                    icon={isOneDrive ? <Cloud size={12} /> : <HardDrive size={12} />}
                  >
                    {isOneDrive ? 'OneDrive' : 'Local'}
                  </Badge>

                  <Badge variant="success">
                    200 OK
                  </Badge>

                  {/* View In-Memory File */}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => handleOpenView(file)}
                    title="View in-memory file"
                  >
                    View
                  </Button>

                  {onRemoveFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} color="var(--mudra-danger)" />}
                      onClick={() => onRemoveFile(file.uploadId)}
                      title="Clear from memory"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mudra Modal for Viewing In-Memory File */}
      {viewingFile && (
        <Modal
          isOpen={Boolean(viewingFile)}
          onClose={() => setViewingFile(null)}
          title={`In-Memory Preview: ${viewingFile.name}`}
          icon={getFileIcon(viewingFile.name, viewingFile.type)}
          footer={
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--mudra-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} color="var(--mudra-success)" />
                <span>Zero local disk / localStorage footprint &bull; Exists in JS RAM</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewingFile(null)}
                >
                  Close
                </Button>
              </div>
            </>
          }
        >
          {/* In-Memory Diagnostics Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--mudra-neutral-200)',
            }}
          >
            <Badge variant="primary" icon={<Cpu size={12} />}>
              Memory: JavaScript Blob Variable
            </Badge>
            <Badge variant="neutral">Size: {formatBytes(viewingFile.size)}</Badge>
            <Badge variant="neutral">MIME: {viewingFile.type}</Badge>
            <Badge variant="success">Upload Status: 200 OK</Badge>
          </div>

          {/* Body Viewer */}
          <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {viewingFile.isImage ? (
              <div style={{ textAlign: 'center', background: 'var(--mudra-neutral-50)', padding: '1rem', borderRadius: '6px' }}>
                <img
                  src={viewingFile.previewUrl}
                  alt={viewingFile.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </div>
            ) : textContent ? (
              <pre
                style={{
                  background: 'var(--mudra-neutral-900)',
                  color: 'var(--mudra-neutral-50)',
                  padding: '1rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--mudra-font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {textContent}
              </pre>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--mudra-neutral-500)' }}>
                <FileText size={48} color="var(--mudra-neutral-400)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 500 }}>In-Memory Binary Buffer ({viewingFile.type})</p>
                <p style={{ fontSize: '0.85rem' }}>
                  The raw file bytes are held in JavaScript variable: <code>window.__activeFileBlob</code>
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
