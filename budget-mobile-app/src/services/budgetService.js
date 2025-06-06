import { connectToDatabase } from '../config/db';

export async function saveBudgetData(userId, data) {
  const { db } = await connectToDatabase();
  const collection = db.collection('budgets');

  await collection.updateOne(
    { userId },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getBudgetData(userId) {
  const { db } = await connectToDatabase();
  const collection = db.collection('budgets');

  const result = await collection.findOne({ userId });
  return result?.data || null;
}

export async function deleteBudgetData(userId) {
  const { db } = await connectToDatabase();
  const collection = db.collection('budgets');

  await collection.deleteOne({ userId });
} 