import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-primary text-secondary font-bold rounded px-4 py-2 hover:opacity-90 focus:outline-none focus:ring focus:ring-primary transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 