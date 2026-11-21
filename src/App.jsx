import React, { useState } from 'react';
import UnifiedFileUpload from './components/UnifiedFileUpload';
import LocalFileUpload from './components/LocalFileUpload';
import OneDriveFilePicker from './components/OneDriveFilePicker';
import ArchitectureGuide from './components/ArchitectureGuide';
import UploadedFilesList from './components/UploadedFilesList';
import SelectedFilesList from './components/SelectedFilesList';
import {
  Cloud,
  HardDrive,
  KeyRound,
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { Card, Button, Badge } from './mudra-ui';
import { MICROSOFT_GRAPH_ACCESS_TOKEN } from './config/authConfig';

export default function App() {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'architecture' | 'playground'
  const [loginType, setLoginType] = useState('microsoft'); // 'microsoft' | 'local'

  // Multi-select option
  const [allowMultiSelect, setAllowMultiSelect] = useState(true);

  // Live Microsoft Graph Access Token
  const [accessToken, setAccessToken] = useState(MICROSOFT_GRAPH_ACCESS_TOKEN || '');
  const [selectedFilePayload, setSelectedFilePayload] = useState(null);

  // Uploaded Files repository (in-memory)
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Standalone playground state
  const [isStandaloneOneDriveOpen, setIsStandaloneOneDriveOpen] = useState(false);
  const [playgroundFiles, setPlaygroundFiles] = useState([]);

  const handleToggleLogin = () => {
    setLoginType((prev) => (prev === 'microsoft' ? 'local' : 'microsoft'));
    setSelectedFilePayload(null);
  };

  const handleUploadSuccess = (incoming) => {
    const items = Array.isArray(incoming) ? incoming : [incoming];
    setUploadedFiles((prev) => [...items, ...prev]);
  };

  const handleRemoveUploadedFile = (uploadId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.uploadId !== uploadId));
  };

  const handleClearAllUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const hasToken = Boolean(accessToken && accessToken.trim() !== '');

  return (
    <div className="container">
      {/* App Header */}
      <header className="app-header">
        <div className="app-title-group">
          <h1>
            <Cloud color="var(--mudra-primary)" size={28} />
            Unified File Upload &amp; OneDrive Integration
          </h1>
          <p>
            Live Microsoft Graph API &bull; Multi-Select Support &bull; Selected Files List &amp; Pop-up Viewer
          </p>
        </div>

        {/* Tab Navigation */}
        <nav className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            Interactive Demo
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            MFE Architecture Guide
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => setActiveTab('playground')}
          >
            Component Playground
          </button>
        </nav>
      </header>

      {/* Auth & Environment Controls */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="control-row">
          <div className="login-toggle-group">
            <span className="toggle-label">Active Login Provider:</span>
            <Button
              variant="outline"
              size="sm"
              icon={loginType === 'microsoft' ? <Cloud size={16} color="var(--mudra-primary)" /> : <HardDrive size={16} />}
              onClick={handleToggleLogin}
              title="Click to toggle login provider"
            >
              {loginType === 'microsoft' ? 'Microsoft Account (OneDrive Enabled)' : 'Local / Standard Account'}
            </Button>
            <span style={{ fontSize: '0.8rem', color: 'var(--mudra-neutral-500)' }}>
              (Click to toggle auth state)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Multi-Select Toggle */}
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--mudra-neutral-800)', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={allowMultiSelect}
                onChange={(e) => setAllowMultiSelect(e.target.checked)}
              />
              <span>Allow Multi-Select</span>
            </label>

            {hasToken ? (
              <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                Live Token Active
              </Badge>
            ) : (
              <Badge variant="warning" icon={<AlertCircle size={12} />}>
                Token Required for Live Graph
              </Badge>
            )}
          </div>
        </div>

        {/* Microsoft Graph Token Input & Status */}
        {loginType === 'microsoft' && (
          <div className="token-input-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label htmlFor="token-input">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <KeyRound size={15} color="var(--mudra-primary)" />
                  Microsoft Graph Access Token &bull; Live Endpoint: <code>https://graph.microsoft.com/v1.0/me/drive/root/children</code>
                </span>
              </label>
            </div>

            <div className="token-input-wrapper" style={{ marginTop: '0.5rem' }}>
              <input
                id="token-input"
                type="password"
                className="input-text"
                placeholder="Hardcode in src/config/authConfig.js or paste here (Bearer eyJ0eXAi...)"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              {accessToken && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAccessToken('')}
                >
                  Clear Token
                </Button>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--mudra-neutral-500)', marginTop: '0.25rem' }}>
              📁 Hardcode file: <code>src/config/authConfig.js</code> (Variable: <code>MICROSOFT_GRAPH_ACCESS_TOKEN</code>)
            </div>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      {activeTab === 'demo' && (
        <div>
          <Card
            title="Unified File Upload Component (Production Wrapper)"
            subtitle="Select one or multiple files from Microsoft OneDrive or Local storage. After selection, the list of selected files appears with an eye icon (👁️) to preview each file in a pop-up modal."
            icon={<Sparkles size={20} color="var(--mudra-primary)" />}
          >
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 0' }}>
              <UnifiedFileUpload
                loginType={loginType}
                accessToken={accessToken}
                multiple={allowMultiSelect}
                accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                label="Contract / Document Attachments"
                onFileSelect={(data) => setSelectedFilePayload(data)}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>

            {/* Selected File Output Inspector */}
            {selectedFilePayload && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--mudra-neutral-200)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Badge variant="success" icon={<FileCheck size={14} />}>
                    Payload Emitted to Parent Form:
                  </Badge>
                </div>
                <pre className="code-box">
                  {JSON.stringify(
                    Array.isArray(selectedFilePayload)
                      ? selectedFilePayload.map((f) => ({
                          source: f.source,
                          name: f.name,
                          size: f.size,
                          type: f.type,
                          cloudId: f.id || undefined,
                        }))
                      : {
                          source: selectedFilePayload.source,
                          name: selectedFilePayload.name,
                          size: selectedFilePayload.size,
                          type: selectedFilePayload.type,
                          cloudId: selectedFilePayload.id || undefined,
                        },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </Card>

          {/* Uploaded Files History */}
          <UploadedFilesList
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveUploadedFile}
            onClearAll={handleClearAllUploadedFiles}
          />
        </div>
      )}

      {/* Tab: Architecture Guide */}
      {activeTab === 'architecture' && <ArchitectureGuide />}

      {/* Tab: Playground */}
      {activeTab === 'playground' && (
        <div>
          <div className="arch-grid">
            {/* Standalone Local Upload */}
            <Card
              title="Standalone Local Upload"
              subtitle={`Mudra UI selector ${allowMultiSelect ? '(Multi-Select Enabled)' : '(Single Select)'}`}
              icon={<HardDrive size={18} color="var(--mudra-neutral-600)" />}
            >
              <LocalFileUpload
                accept=".pdf,.docx,.xlsx,image/*"
                multiple={allowMultiSelect}
                onFileSelect={(f) => {
                  const arr = Array.isArray(f) ? f : [f];
                  setPlaygroundFiles((prev) => [...prev, ...arr]);
                }}
                onUploadSuccess={handleUploadSuccess}
              />
            </Card>

            {/* Standalone OneDrive Picker */}
            <Card
              title="Standalone Mudra OneDrive Modal"
              subtitle={`Live Graph API modal ${allowMultiSelect ? '(Multi-Select Enabled)' : '(Single Select)'}`}
              icon={<Cloud size={18} color="var(--mudra-primary)" />}
            >
              <Button
                variant="primary"
                icon={<Cloud size={16} />}
                onClick={() => setIsStandaloneOneDriveOpen(true)}
              >
                Open Mudra OneDrive Dialog
              </Button>

              <OneDriveFilePicker
                isOpen={isStandaloneOneDriveOpen}
                onClose={() => setIsStandaloneOneDriveOpen(false)}
                accessToken={accessToken}
                multiple={allowMultiSelect}
                onFileSelect={(f) => {
                  const arr = Array.isArray(f) ? f : [f];
                  setPlaygroundFiles((prev) => [...prev, ...arr]);
                }}
                onUploadSuccess={handleUploadSuccess}
              />
            </Card>
          </div>

          {playgroundFiles.length > 0 && (
            <Card style={{ marginTop: '1.5rem' }}>
              <SelectedFilesList
                files={playgroundFiles}
                onRemoveFile={(file, idx) => setPlaygroundFiles((prev) => prev.filter((_, i) => i !== idx))}
                title="Playground Selected Files"
              />
            </Card>
          )}

          {/* Uploaded Files in Playground too */}
          <UploadedFilesList
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveUploadedFile}
            onClearAll={handleClearAllUploadedFiles}
          />
        </div>
      )}
    </div>
  );
}
