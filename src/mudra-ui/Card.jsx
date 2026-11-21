import React from 'react';

export function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  style,
}) {
  return (
    <div className={`mudra-card ${className}`} style={style}>
      {(title || subtitle || action) && (
        <div className="mudra-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            {title && (
              <h3 className="mudra-card-title">
                {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
                {title}
              </h3>
            )}
            {subtitle && <p className="mudra-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
