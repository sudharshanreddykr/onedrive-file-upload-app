import React from 'react';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="mudra-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.id || index}>
            {index > 0 && <ChevronRight size={14} color="#94a3b8" />}
            {isLast || !item.onClick ? (
              <span className="mudra-breadcrumb-current">{item.label}</span>
            ) : (
              <button
                type="button"
                className="mudra-breadcrumb-link"
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
