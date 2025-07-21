import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Fade,
  Zoom,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Psychology,
  TrendingUp,
  Savings,
  Warning,
  CheckCircle,
  Lightbulb,
  Chat,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

const AIAssistant = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  
  const {
    data,
    categories,
    revenus,
    expenses,
    savings,
    debts,
    selectedMonth,
    selectedYear,
    appSettings
  } = useStore();

  // Analyse des données pour l'IA
  const financialAnalysis = useMemo(() => {
    const currentMonthIndex = selectedMonth;
    const currentExpenses = categories.map(cat => data[cat]?.[currentMonthIndex] || 0);
    const totalExpenses = currentExpenses.reduce((sum, val) => sum + val, 0);
    const totalIncome = revenus[currentMonthIndex] || 0;
    const balance = totalIncome - totalExpenses;
    
    // Trouver les catégories les plus dépensées
    const categorySpending = categories.map((cat, index) => ({
      category: cat,
      amount: currentExpenses[index],
      percentage: totalExpenses > 0 ? (currentExpenses[index] / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Analyser les tendances
    const previousMonthIndex = Math.max(0, currentMonthIndex - 1);
    const previousExpenses = categories.map(cat => data[cat]?.[previousMonthIndex] || 0);
    const previousTotal = previousExpenses.reduce((sum, val) => sum + val, 0);
    const expenseTrend = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;

    return {
      balance,
      totalExpenses,
      totalIncome,
      categorySpending,
      expenseTrend,
      savingsRate: totalIncome > 0 ? (balance / totalIncome) * 100 : 0
    };
  }, [data, categories, revenus, selectedMonth]);

  // Générer des suggestions intelligentes
  const generateSuggestions = useMemo(() => {
    const suggestions = [];
    
    if (financialAnalysis.balance < 0) {
      suggestions.push({
        text: "Comment réduire mes dépenses ?",
        icon: <TrendingUp />,
        priority: 'high'
      });
    }
    
    if (financialAnalysis.savingsRate < 20) {
      suggestions.push({
        text: "Comment augmenter mon épargne ?",
        icon: <Savings />,
        priority: 'medium'
      });
    }
    
    if (financialAnalysis.categorySpending[0]?.percentage > 40) {
      suggestions.push({
        text: `Optimiser mes dépenses en ${financialAnalysis.categorySpending[0].category}`,
        icon: <Warning />,
        priority: 'medium'
      });
    }
    
    if (savings.length === 0) {
      suggestions.push({
        text: "Créer un objectif d'épargne",
        icon: <CheckCircle />,
        priority: 'low'
      });
    }
    
    return suggestions;
  }, [financialAnalysis, savings]);

  // Réponses de l'IA
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simuler un délai de réponse
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let response = "";
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("dépense") || lowerMessage.includes("économiser")) {
      response = `Voici mes conseils pour optimiser vos dépenses :
      
💰 **Vos plus grosses dépenses ce mois-ci :**
${financialAnalysis.categorySpending.slice(0, 3).map(cat => 
  `• ${cat.category} : ${cat.amount.toFixed(0)}€ (${cat.percentage.toFixed(1)}%)`
).join('\n')}

💡 **Suggestions d'optimisation :**
• Réduisez vos dépenses en ${financialAnalysis.categorySpending[0]?.category} de 10%
• Créez un budget strict pour les dépenses non essentielles
• Utilisez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne`;
    }
    
    else if (lowerMessage.includes("épargne") || lowerMessage.includes("sauvegarder")) {
      const currentSavingsRate = financialAnalysis.savingsRate;
      response = `📈 **Votre taux d'épargne actuel : ${currentSavingsRate.toFixed(1)}%**
      
${currentSavingsRate < 20 ? 
  `🎯 **Objectif recommandé : 20% minimum**
  
💡 **Pour augmenter votre épargne :**
• Automatisez vos virements d'épargne
• Appliquez la règle "payez-vous en premier"
• Créez un fonds d'urgence de 3-6 mois de dépenses
• Investissez dans des placements adaptés à votre profil` :
  
  `🎉 **Excellent ! Vous êtes sur la bonne voie.**
  
💡 **Pour optimiser davantage :**
• Diversifiez vos placements
• Considérez l'investissement long terme
• Planifiez vos objectifs financiers à 5-10 ans`
}`;
    }
    
    else if (lowerMessage.includes("budget") || lowerMessage.includes("planifier")) {
      response = `📊 **Analyse de votre budget actuel :**
      
💰 **Revenus :** ${financialAnalysis.totalIncome.toFixed(0)}€
💸 **Dépenses :** ${financialAnalysis.totalExpenses.toFixed(0)}€
⚖️ **Solde :** ${financialAnalysis.balance >= 0 ? '+' : ''}${financialAnalysis.balance.toFixed(0)}€

📈 **Tendance :** ${financialAnalysis.expenseTrend > 0 ? '+' : ''}${financialAnalysis.expenseTrend.toFixed(1)}% vs mois dernier

💡 **Recommandations :**
• ${financialAnalysis.balance < 0 ? 'Réduisez vos dépenses de ' + Math.abs(financialAnalysis.balance).toFixed(0) + '€ pour équilibrer votre budget' : 'Continuez sur cette lancée !'}
• Suivez vos dépenses quotidiennement
• Planifiez vos grosses dépenses à l'avance`;
    }
    
    else if (lowerMessage.includes("bonjour") || lowerMessage.includes("salut")) {
      response = `👋 Bonjour ! Je suis votre assistant financier personnel.

💰 **Votre situation actuelle :**
• Solde du mois : ${financialAnalysis.balance >= 0 ? '+' : ''}${financialAnalysis.balance.toFixed(0)}€
• Taux d'épargne : ${financialAnalysis.savingsRate.toFixed(1)}%

💡 **Comment puis-je vous aider aujourd'hui ?**
• Analyser vos dépenses
• Optimiser votre épargne  
• Planifier votre budget
• Conseils personnalisés`;
    }
    
    else {
      response = `🤔 Je ne suis pas sûr de comprendre votre demande.
      
💡 **Voici ce que je peux faire pour vous :**
• Analyser vos finances
• Donner des conseils d'optimisation
• Aider à planifier votre budget
• Répondre à vos questions financières

N'hésitez pas à me poser des questions plus spécifiques !`;
    }
    
    return response;
  };

  // Gérer l'envoi d'un message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Ajouter le message utilisateur
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Générer la réponse de l'IA
    const aiResponse = await generateAIResponse(userMessage);
    
    const newAIMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newAIMessage]);
    setIsTyping(false);
  };

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message de bienvenue initial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: `👋 Bonjour ! Je suis votre assistant financier personnel.

💰 **Votre situation actuelle :**
• Solde du mois : ${financialAnalysis.balance >= 0 ? '+' : ''}${financialAnalysis.balance.toFixed(0)}€
• Taux d'épargne : ${financialAnalysis.savingsRate.toFixed(1)}%

💡 **Comment puis-je vous aider aujourd'hui ?**`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setSuggestions(generateSuggestions);
    }
  }, [isOpen]);

  // Interface de chat
  const ChatInterface = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <SmartToy />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">Assistant IA</Typography>
          <Typography variant="caption" color="text.secondary">
            {isTyping ? 'En train d\'écrire...' : 'En ligne'}
          </Typography>
        </Box>
        <IconButton onClick={() => setIsOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message) => (
          <Fade in key={message.id}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}>
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  whiteSpace: 'pre-line'
                }}
              >
                <Typography variant="body2">
                  {message.text}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        ))}
        
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">
              L'assistant réfléchit...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggestions rapides */}
      {suggestions.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Suggestions :
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion.text}
                size="small"
                icon={suggestion.icon}
                onClick={() => setInputValue(suggestion.text)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Posez votre question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            size="small"
          />
          <IconButton 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            color="primary"
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Bouton flottant */}
      <Fab
        color="primary"
        size="large"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
          }
        }}
      >
        <Chat />
      </Fab>

      {/* Drawer de chat */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <ChatInterface />
      </Drawer>
    </>
  );
};

export default AIAssistant; 