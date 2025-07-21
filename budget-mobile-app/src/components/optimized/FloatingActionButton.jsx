import React, { useState, useMemo } from 'react';
import { 
  Fab, 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon,
  Zoom,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  AccountBalance as BankIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Savings as SavingsIcon
} from '@mui/icons-material';
import { useStore } from '../../store';

const FloatingActionButton = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const { getCurrentPlan } = useStore();
  const currentPlan = getCurrentPlan();

  const actions = useMemo(() => [
    {
      icon: <ExpenseIcon />,
      name: 'Dépense',
      action: 'expense',
      color: '#ef4444'
    },
    {
      icon: <IncomeIcon />,
      name: 'Revenu', 
      action: 'income',
      color: '#10b981'
    },
    {
      icon: <SavingsIcon />,
      name: 'Épargne',
      action: 'savings',
      color: '#3b82f6',
      premium: true
    },
    {
      icon: <BankIcon />,
      name: 'Compte',
      action: 'bank',
      color: '#8b5cf6',
      premium: true
    }
  ], []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAction = (action) => {
    handleClose();
    onAction?.(action);
  };

  const availableActions = actions.filter(action => 
    !action.premium || currentPlan.features.multipleAccounts
  );

  return (
    <Fade in timeout={300}>
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          '& .MuiFab-primary': {
            width: 56,
            height: 56,
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            }
          }
        }}
        icon={<SpeedDialIcon openIcon={<AddIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        FabProps={{
          size: "large"
        }}
      >
        {availableActions.map((action) => (
          <SpeedDialAction
            key={action.action}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleAction(action.action)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                backgroundColor: action.color,
                '&:hover': {
                  backgroundColor: action.color,
                  opacity: 0.8
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Fade>
  );
};

export default FloatingActionButton; 