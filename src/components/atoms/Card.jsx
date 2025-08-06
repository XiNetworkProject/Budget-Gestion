import React from 'react';

const Card = ({ className = '', children, ...props }) => {
  return (
    <div className={`bg-secondary text-primary rounded shadow p-4 transition ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card; 