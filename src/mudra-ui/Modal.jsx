import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = '680px',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="mudra-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="mudra-modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mudra-modal-header">
          <div className="mudra-modal-title">
            {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
            <span>{title}</span>
          </div>
          <button
            type="button"
            className="mudra-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mudra-modal-body">{children}</div>

        {footer && <div className="mudra-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
