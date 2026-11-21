import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Code } from 'lucide-react';

export default function ArchitectureGuide() {
  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="card">
        <h2 className="card-title">
          <Layers size={22} color="#2563eb" />
          Production Architecture Recommendation: Where should the Wrapper live?
        </h2>
        <p className="card-subtitle">
          Comparing <strong>SSE-web app</strong> vs <strong>login-mfe</strong> in a Microfrontend (MFE) ecosystem.
        </p>

        {/* Verdict Banner */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e40af', fontWeight: 700, fontSize: '1.05rem' }}>
            <ShieldCheck size={24} />
            <span>Recommended Decision: Build the Wrapper Component inside <u>SSE-web app</u> (or a Shared UI Package)</span>
          </div>
          <p style={{ marginTop: '0.5rem', color: '#1e3a8a', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <strong>Why?</strong> The primary responsibility of <code>login-mfe</code> is authentication &amp; token lifecycle.
            Document upload workflows, file type validation, and form attachments belong in the feature application (<code>SSE-web app</code>).
            Building the wrapper in <code>SSE-web app</code> prevents circular dependencies and keeps your auth microfrontend lean and stable.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="arch-grid">
          {/* SSE-web app (Winner) */}
          <div className="arch-card highlight">
            <div className="arch-header" style={{ color: '#1d4ed8' }}>
              <CheckCircle2 size={20} color="#2563eb" />
              <span>1. Wrapper in SSE-web app (Recommended)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
              <code>SSE-web app</code> already owns the existing Local File Upload component and form business logic. It consumes the auth state/token from <code>login-mfe</code>.
            </p>
            <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li><strong>Zero Circular Dependency:</strong> <code>SSE-web app</code> imports from <code>login-mfe</code>, never the other way around.</li>
              <li><strong>Contextual Flexibility:</strong> Different views in SSE-web app can configure different <code>accept</code> types (e.g., invoices vs profile pics).</li>
              <li><strong>Lean Auth MFE:</strong> Any file-handling UI changes do not require redeploying the mission-critical <code>login-mfe</code>.</li>
            </ul>

            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Structure in SSE-web app:</strong>
              <pre className="code-box">
{`// SSE-web app: src/components/UnifiedFileUpload.jsx
import { useAuth } from 'login_mfe/authContext';
import { OneDriveFilePicker } from 'login_mfe/OneDriveFilePicker';
import { LocalFileUpload } from './LocalFileUpload';

export function UnifiedFileUpload(props) {
  const { loginType, accessToken } = useAuth();
  
  return loginType === 'microsoft' ? (
    <OneDriveFilePicker accessToken={accessToken} {...props} />
  ) : (
    <LocalFileUpload {...props} />
  );
}`}
              </pre>
            </div>
          </div>

          {/* login-mfe (Anti-pattern) */}
          <div className="arch-card">
            <div className="arch-header" style={{ color: '#b45309' }}>
              <AlertTriangle size={20} color="#d97706" />
              <span>2. Wrapper in login-mfe (Not Recommended)</span>
            </div> q
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
              Building the wrapper inside <code>login-mfe</code> forces the auth microfrontend to take on UI document upload responsibilities.
            </p>
            <ul style={{ fontSize: '0.85rem', color: '#b45309', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li><strong>Violation of Single Responsibility:</strong> Auth microfrontend becomes bloated with file pickers, drag-and-drop, and icons.</li>
              <li><strong>Circular Dependency Risk:</strong> Since Local File Upload already lives in SSE-web app, login-mfe would need to import it back or duplicate it.</li>
              <li><strong>High Risk Deployment:</strong> A minor UI tweak to file buttons requires testing and redeploying the login authentication gateway.</li>
            </ul>

            <div style={{ marginTop: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>What login-mfe should actually export:</strong>
              <pre className="code-box">
{`// login-mfe: src/export.js (Module Federation)
export { AuthProvider, useAuth } from './context/AuthContext';
export { OneDriveFilePicker } from './components/OneDriveFilePicker';

// login-mfe provides:
// 1. User loginType ('microsoft' | 'local')
// 2. Microsoft Graph Access Token with scope:
//    ['Files.Read', 'User.Read']`}
              </pre>
            </div>
          </div>
        </div>

        {/* Microfrontend Contract Diagram */}
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Code size={18} color="#0078d4" /> Microfrontend Contract Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-ms">login-mfe</span>
              <ArrowRight size={14} color="#64748b" />
              <span>Exposes <code>loginType</code>, Microsoft Graph <code>accessToken</code>, and <code>OneDriveFilePicker</code> component.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-local">SSE-web app</span>
              <ArrowRight size={14} color="#64748b" />
              <span>Houses the <code>UnifiedFileUpload</code> wrapper, your existing <code>LocalFileUpload</code>, and connects to business form submits.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
