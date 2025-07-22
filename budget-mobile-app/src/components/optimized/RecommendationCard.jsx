import React, { memo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Psychology,
  ArrowForward
} from '@mui/icons-material';

const RecommendationCard = memo(({ 
  recommendation, 
  onAction, 
  priority = 'medium',
  index = 0 
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#ff9800';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high': return <Warning sx={{ color: '#f44336' }} />;
      case 'medium': return <TrendingUp sx={{ color: '#ff9800' }} />;
      case 'low': return <CheckCircle sx={{ color: '#4caf50' }} />;
      default: return <TrendingUp sx={{ color: '#ff9800' }} />;
    }
  };

  const getActionButtonColor = () => {
    switch (recommendation.actionType) {
      case 'review_expenses':
      case 'analyze_expenses':
        return '#f44336';
      case 'create_savings_plan':
      case 'optimize_investment':
        return '#4caf50';
      case 'reduce_expenses':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  const getActionButtonText = () => {
    switch (recommendation.actionType) {
      case 'review_expenses':
      case 'analyze_expenses':
        return 'Analyser';
      case 'create_savings_plan':
      case 'optimize_investment':
        return 'Planifier';
      case 'reduce_expenses':
        return 'Réduire';
      default:
        return 'Voir plus';
    }
  };

  return (
    <Zoom in timeout={800 + index * 100}>
      <Box sx={{ 
        p: 3, 
        mb: 2,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
        }
      }}>
        {/* Indicateur de priorité */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${getPriorityColor()} 0%, ${getPriorityColor()}dd 100%)`,
          borderRadius: '3px 3px 0 0'
        }} />

        {/* En-tête de la recommandation */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${getPriorityColor()} 0%, ${getPriorityColor()}dd 100%)`,
            mr: 2,
            boxShadow: `0 4px 12px ${getPriorityColor()}30`
          }}>
            <Lightbulb sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {recommendation.title}
              </Typography>
              
              <Tooltip title={`Priorité: ${priority}`} arrow>
                <Box>
                  {getPriorityIcon()}
                </Box>
              </Tooltip>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.5
              }}
            >
              {recommendation.description}
            </Typography>
          </Box>
        </Box>

        {/* Tags et métriques */}
        {recommendation.tags && recommendation.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {recommendation.tags.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '0.75rem'
                }}
              />
            ))}
          </Box>
        )}

        {/* Métriques si disponibles */}
        {recommendation.metrics && (
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            p: 2,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {Object.entries(recommendation.metrics).map(([key, value]) => (
              <Box key={key} sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'white',
                    fontSize: '1.1rem'
                  }}
                >
                  {value}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'capitalize'
                  }}
                >
                  {key.replace(/_/g, ' ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.6)',
                fontStyle: 'italic'
              }}
            >
              Recommandation IA
            </Typography>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => onAction(recommendation)}
            sx={{
              background: `linear-gradient(135deg, ${getActionButtonColor()} 0%, ${getActionButtonColor()}dd 100%)`,
              boxShadow: `0 4px 12px ${getActionButtonColor()}30`,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: `linear-gradient(135deg, ${getActionButtonColor()}dd 0%, ${getActionButtonColor()}bb 100%)`,
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 16px ${getActionButtonColor()}40`,
              }
            }}
          >
            {getActionButtonText()}
          </Button>
        </Box>

        {/* Effet de brillance */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          transition: 'left 0.5s ease',
          '&:hover': {
            left: '100%'
          }
        }} />
      </Box>
    </Zoom>
  );
});

const RecommendationsSection = memo(({ 
  recommendations, 
  loading, 
  onActionClick, 
  t 
}) => {
  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        mb: 4,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            mr: 2,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
          }}>
            <Lightbulb sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Chargement des recommandations...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      p: 3, 
      mb: 4,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: 4,
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      }
    }}>
      {/* En-tête de la section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          mr: 2,
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
        }}>
          <Lightbulb sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Recommandations intelligentes
        </Typography>
        <Chip 
          label={t('home.ai')} 
          size="small" 
          sx={{ 
            ml: 2,
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
          }}
        />
      </Box>
      
      {/* Liste des recommandations */}
      <Box>
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id || index}
            recommendation={recommendation}
            onAction={onActionClick}
            priority={recommendation.priority || 'medium'}
            index={index}
          />
        ))}
      </Box>
    </Box>
  );
});

RecommendationCard.displayName = 'RecommendationCard';
RecommendationsSection.displayName = 'RecommendationsSection';

export { RecommendationCard, RecommendationsSection };
export default RecommendationCard; 