import React from 'react';

export const GlassCard = ({ children, className = '' }) => (
  <div className={`card-premium ${className}`}>
    {children}
  </div>
);
