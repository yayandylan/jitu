import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; 
import userModel from '@/models/User'; 
import transactionModel from '@/models/Transaction'; 

export async function GET() {
  try {
    await connectDB();
    const transactions = await transactionModel.find({}).populate('userId', 'name').sort({ createdAt: -1 }).lean();
    const totalUser = await userModel.countDocuments({ role: 'user' });

    const income = transactions.filter(t => t.type === 'in' && (t.status === 'success' || t.status === 'SUCCESS'));
    const expenses = transactions.filter(t => t.type === 'out');

    const totalIncome = income.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
    const totalCost = expenses.reduce((sum, t) => sum + (t.actualCost || 0), 0);

    const toolUsage = expenses.reduce((acc, t) => {
      acc[t.description] = (acc[t.description] || 0) + 1;
      return acc;
    }, {});
    
    const topTools = Object.entries(toolUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return NextResponse.json({
      stats: { totalUser, totalIncome, totalCost, profit: totalIncome - totalCost },
      recent: transactions.slice(0, 5),
      topTools
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}