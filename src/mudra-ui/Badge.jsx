import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'primary' | 'neutral' | 'success' | 'warning'
  icon,
  className = '',
  style,
}) {
  return (
    <span className={`mudra-badge mudra-badge-${variant} ${className}`} style={style}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
}
