import React, { useState, useEffect } from 'react';
import { Zoom } from '@mui/material';

const SafeZoom = ({ 
  children, 
  in: inProp = true, 
  timeout = 800, 
  style = {},
  onEnter,
  onExit,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (inProp && !hasError) {
      // Délai pour éviter les erreurs de DOM
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [inProp, hasError]);

  const handleEnter = (node, isAppearing) => {
    try {
      if (onEnter) {
        onEnter(node, isAppearing);
      }
    } catch (error) {
      console.warn('SafeZoom: Error in onEnter', error);
      setHasError(true);
    }
  };

  const handleExit = (node) => {
    try {
      if (onExit) {
        onExit(node);
      }
    } catch (error) {
      console.warn('SafeZoom: Error in onExit', error);
    }
  };

  // Si il y a eu une erreur, on rend sans animation
  if (hasError) {
    return inProp ? <div style={style}>{children}</div> : null;
  }

  return (
    <Zoom
      in={isVisible && inProp}
      timeout={timeout}
      onEnter={handleEnter}
      onExit={handleExit}
      style={style}
      {...props}
    >
      <div style={{ display: 'flex', width: '100%' }}>
        {children}
      </div>
    </Zoom>
  );
};

export default SafeZoom; 