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
  Cpu
} from 'lucide-react';
import { formatBytes } from '../services/oneDriveService';
import { Badge, Button } from '../mudra-ui';
import FilePreviewModal from './FilePreviewModal';

function getFileIcon(fileName, mimeType = '') {
  const name = (fileName || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

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

/**
 * Component to show the list of selected files with an Eye icon to view in a pop up.
 */
export default function SelectedFilesList({
  files = [],
  onRemoveFile,
  title = 'Selected Files',
}) {
  const [viewingFile, setViewingFile] = useState(null);

  if (!files || files.length === 0) return null;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--mudra-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={16} color="var(--mudra-success)" />
          {title} ({files.length})
        </h4>
        <span style={{ fontSize: '0.78rem', color: 'var(--mudra-neutral-500)' }}>
          Click the eye icon (👁️) to preview in popup
        </span>
      </div>

      <div className="file-list" style={{ border: '1px solid var(--mudra-neutral-200)', borderRadius: '6px' }}>
        {files.map((file, idx) => {
          const isOneDrive = file.source === 'onedrive';
          const fileKey = file.id || file.uploadId || `${file.name}-${idx}`;

          return (
            <div key={fileKey} className="file-item" style={{ cursor: 'default' }}>
              <div className="file-item-left">
                {getFileIcon(file.name, file.type)}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--mudra-neutral-900)' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--mudra-neutral-500)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                    <span>{formatBytes(file.size)}</span>
                    <span>&bull;</span>
                    <span style={{ color: 'var(--mudra-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Cpu size={11} /> In-Memory Variable
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

                {/* Eye Icon to view file in a popup */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye size={15} />}
                  onClick={() => setViewingFile(file)}
                  title="View file in popup"
                >
                  View
                </Button>

                {onRemoveFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} color="var(--mudra-danger)" />}
                    onClick={() => onRemoveFile(file, idx)}
                    title="Remove file"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pop-up Modal to view selected file */}
      <FilePreviewModal
        isOpen={Boolean(viewingFile)}
        onClose={() => setViewingFile(null)}
        file={viewingFile}
      />
    </div>
  );
}
