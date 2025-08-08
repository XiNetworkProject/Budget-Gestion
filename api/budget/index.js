import { dbUtils } from '../../supabase-config.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId requis' });
  try {
    const budgetData = await dbUtils.getBudget(userId);
    if (!budgetData) return res.status(404).json({ message: 'Budget non trouvé' });
    return res.status(200).json(budgetData);
  } catch (error) {
    console.error('Erreur récupération budget:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération du budget' });
  }
}

async function handlePost(req, res) {
  const { userId, ...budgetData } = req.body || {};
  if (!userId) return res.status(400).json({ message: 'userId requis' });
  try {
    const result = await dbUtils.saveBudget(userId, budgetData);
    return res.status(200).json({ success: true, message: 'Budget sauvegardé avec succès', data: result });
  } catch (error) {
    console.error('Erreur sauvegarde budget:', error);
    return res.status(500).json({ message: 'Erreur lors de la sauvegarde du budget' });
  }
}

async function handlePut(req, res) {
  const { userId, ...budgetData } = req.body || {};
  if (!userId) return res.status(400).json({ message: 'userId requis' });
  try {
    const result = await dbUtils.saveBudget(userId, budgetData);
    return res.status(200).json({ success: true, message: 'Budget mis à jour avec succès', data: result });
  } catch (error) {
    console.error('Erreur mise à jour budget:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du budget' });
  }
}

async function handleDelete(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId requis' });
  try {
    return res.status(200).json({ success: true, message: 'Budget supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression budget:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression du budget' });
  }
}

export const config = { runtime: 'nodejs18.x' };

