import React from 'react';
import { toast } from 'react-hot-toast';

export const showUndoToast = (message, onUndo) => {
  const id = toast(
    (t) => React.createElement(
      'span',
      null,
      message,
      React.createElement(
        'button',
        {
          onClick: () => {
            if (typeof onUndo === 'function') onUndo();
            toast.dismiss(t.id);
          },
          style: {
            marginLeft: 8,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer'
          }
        },
        'Annuler'
      )
    ),
    { duration: 5000 }
  );
  return id;
};

export default showUndoToast;


