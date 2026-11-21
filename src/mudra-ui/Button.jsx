import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon,
  iconRight,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`mudra-btn mudra-btn-${variant} mudra-btn-${size} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <span className="mudra-spinner mudra-spinner-sm" style={{ marginRight: children ? '0.35rem' : 0 }} />
      ) : (
        icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
      {!loading && iconRight && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconRight}</span>}
    </button>
  );
}
