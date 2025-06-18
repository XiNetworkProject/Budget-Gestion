import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`bg-secondary text-primary border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-primary transition ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input; 