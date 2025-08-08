import { toast } from 'react-hot-toast';

export const showUndoToast = (message, onUndo) => {
  const id = toast((t) => (
    <span>
      {message}
      <button
        onClick={() => { onUndo?.(); toast.dismiss(t.id); }}
        style={{ marginLeft: 8, padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6 }}
      >
        Annuler
      </button>
    </span>
  ), { duration: 5000 });
  return id;
};

export default showUndoToast;


