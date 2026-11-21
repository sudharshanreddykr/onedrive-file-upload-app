import React from 'react';

export function Spinner({ size = 'md', className = '', style }) {
  return (
    <div
      className={`mudra-spinner mudra-spinner-${size} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    />
  );
}
