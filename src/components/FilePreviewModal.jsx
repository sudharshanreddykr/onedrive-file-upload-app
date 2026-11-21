import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { formatBytes } from '../services/oneDriveService';
import { Modal, Button, Badge } from '../mudra-ui';

function getFileIcon(fileName, mimeType = '') {
  const name = (fileName || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (mime.includes('image') || /\.(png|jpe?g|svg|gif|webp)$/.test(name)) {
    return <FileImage size={22} color="#0ea5e9" />;
  }
  if (mime.includes('spreadsheet') || /\.(xlsx|xls|csv)$/.test(name)) {
    return <FileSpreadsheet size={22} color="var(--mudra-success)" />;
  }
  if (mime.includes('pdf') || /\.(pdf|docx?|txt)$/.test(name)) {
    return <FileText size={22} color="var(--mudra-danger)" />;
  }
  if (/\.(json|js|jsx|ts|tsx|html|css)$/.test(name)) {
    return <FileCode size={22} color="#8b5cf6" />;
  }
  return <FileIcon size={22} color="var(--mudra-neutral-500)" />;
}

/**
 * Dedicated Pop-up Modal to view a selected file or image in memory
 */
export default function FilePreviewModal({
  isOpen,
  onClose,
  file,
}) {
  const [textContent, setTextContent] = useState('');
  const [isReadingText, setIsReadingText] = useState(false);

  useEffect(() => {
    if (!file || !isOpen) {
      setTextContent('');
      return;
    }

    // Expose active in-memory blob to window for console debugging
    if (typeof window !== 'undefined' && file.inMemoryBlob) {
      window.__viewingFileBlob = file.inMemoryBlob;
      console.log('👁️ Viewing file from in-memory variable (window.__viewingFileBlob):', file);
    }

    const isImage = file.isImage || (file.type || '').startsWith('image/') || /\.(png|jpe?g|svg|webp|gif)$/i.test(file.name);

    if (!isImage) {
      setIsReadingText(true);
      // Read text from in-memory blob
      if (file.inMemoryBlob && typeof file.inMemoryBlob.text === 'function') {
        file.inMemoryBlob.text()
          .then((text) => setTextContent(text))
          .catch(() => setTextContent('Unable to read in-memory document content.'))
          .finally(() => setIsReadingText(false));
      } else if (file.previewUrl) {
        fetch(file.previewUrl)
          .then((r) => r.text())
          .then((text) => setTextContent(text))
          .catch(() => setTextContent('Unable to load document preview.'))
          .finally(() => setIsReadingText(false));
      } else {
        setIsReadingText(false);
      }
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const isImage = file.isImage || (file.type || '').startsWith('image/') || /\.(png|jpe?g|svg|webp|gif)$/i.test(file.name);
  const previewSource = file.previewUrl || (file.inMemoryBlob ? URL.createObjectURL(file.inMemoryBlob) : null);

  const modalFooter = (
    <>
      <div style={{ fontSize: '0.85rem', color: 'var(--mudra-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ShieldCheck size={16} color="var(--mudra-success)" />
        <span>In-Memory RAM Variable &bull; Zero local disk / localStorage write</span>
      </div>
      <Button variant="primary" size="sm" onClick={onClose}>
        Close Viewer
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${file.name}`}
      icon={getFileIcon(file.name, file.type)}
      footer={modalFooter}
      maxWidth="720px"
    >
      {/* File Metadata Badges */}
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
        <Badge variant={file.source === 'onedrive' ? 'primary' : 'neutral'}>
          Source: {file.source === 'onedrive' ? 'Microsoft OneDrive' : 'Local Storage'}
        </Badge>
        <Badge variant="neutral">Size: {formatBytes(file.size)}</Badge>
        <Badge variant="neutral">Type: {file.type || 'Standard'}</Badge>
        <Badge variant="primary" icon={<Cpu size={12} />}>
          RAM Variable (Blob)
        </Badge>
      </div>

      {/* Viewer Content Area */}
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {isImage && previewSource ? (
          <div
            style={{
              textAlign: 'center',
              background: 'var(--mudra-neutral-100)',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--mudra-neutral-200)',
            }}
          >
            <img
              src={previewSource}
              alt={file.name}
              style={{
                maxWidth: '100%',
                maxHeight: '420px',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
          </div>
        ) : isReadingText ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--mudra-neutral-500)' }}>
            <p>Reading file from in-memory stream...</p>
          </div>
        ) : textContent ? (
          <pre
            style={{
              background: 'var(--mudra-neutral-900)',
              color: 'var(--mudra-neutral-50)',
              padding: '1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--mudra-font-mono)',
              fontSize: '0.82rem',
              lineHeight: '1.5',
              maxHeight: '400px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {textContent}
          </pre>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--mudra-neutral-500)' }}>
            <FileText size={48} color="var(--mudra-neutral-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontWeight: 600, color: 'var(--mudra-neutral-800)' }}>Binary Document ({file.type})</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              File bytes are loaded in JavaScript memory variable (<code>window.__viewingFileBlob</code>).
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
