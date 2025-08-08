import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, TextField, List, ListItem, ListItemText, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const commands = [
  { label: 'Aller à Accueil', path: '/home' },
  { label: 'Aller à Dépenses', path: '/expenses' },
  { label: 'Aller à Revenus', path: '/income' },
  { label: 'Aller à Épargne', path: '/savings' },
  { label: 'Aller à Analytics', path: '/analytics' },
  { label: 'Aller à Paramètres', path: '/settings' },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const list = useMemo(() => {
    const term = q.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(term));
  }, [q]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogContent>
        <TextField fullWidth placeholder="Rechercher une action ou une page (Ctrl/Cmd+K)" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
          <List>
            {list.map((c) => (
              <ListItem button key={c.path} onClick={() => { setOpen(false); navigate(c.path); }}>
                <ListItemText primary={c.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;


