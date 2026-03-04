import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('month_year') || new Date().toISOString().slice(0, 7); // e.g., '2024-03'

    // We can run these concurrently for better performance
    const [
      transactionsResult,
      fixedChargesResult,
      savingsResult,
      remindersResult,
      budgetResult,
      recentTransactionsResult,
      balanceResult,
      futureTransactionsResult
    ] = await Promise.all([
      // Get current month income and expenses (full month view)
      sql`
        SELECT type, SUM(amount) as total 
        FROM transactions 
        WHERE user_id = ${userId} 
        AND TO_CHAR(transaction_date, 'YYYY-MM') = ${monthYear}
        GROUP BY type
      `,
      // Total fixed charges
      sql`
        SELECT SUM(amount) as total FROM fixed_charges WHERE user_id = ${userId}
      `,
      // Savings summary
      sql`
        SELECT SUM(current_amount) as saved, SUM(target_amount) as target
        FROM savings_goals WHERE user_id = ${userId}
      `,
      // Upcoming reminders (next 7 days, limit 5)
      sql`
        SELECT * FROM reminders 
        WHERE user_id = ${userId} AND is_completed = false
        AND due_date >= CURRENT_DATE 
        AND due_date <= CURRENT_DATE + INTERVAL '7 days'
        ORDER BY due_date ASC
        LIMIT 5
      `,
      // Budget data: only count "spent" if transaction date has passed or is today
      sql`
        SELECT 
          b.*,
          COALESCE(SUM(CASE WHEN t.type = 'expense' AND t.transaction_date <= CURRENT_DATE THEN t.amount ELSE 0 END), 0) as spent
        FROM budget b
        LEFT JOIN transactions t ON 
          LOWER(b.category) = LOWER(t.category) AND 
          b.user_id = t.user_id AND 
          TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month_year
        WHERE b.user_id = ${userId} AND b.month_year = ${monthYear}
        GROUP BY b.id
      `,
      // Recent transactions
      sql`
        SELECT * FROM transactions 
        WHERE user_id = ${userId} 
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT 10
      `,
      // REAL Total Balance (All time income - expenses UP TO TODAY)
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total
        FROM transactions 
        WHERE user_id = ${userId} AND transaction_date <= CURRENT_DATE
      `,
      // Future Transactions for Projection (Up to 1 Year)
      sql`
        SELECT * FROM transactions
        WHERE user_id = ${userId} 
        AND transaction_date > CURRENT_DATE 
        AND transaction_date <= CURRENT_DATE + INTERVAL '365 days'
        ORDER BY transaction_date ASC
      `
    ]);

    // Format income and expenses for the month
    let income = 0;
    let expenses = 0;
    transactionsResult.forEach((row) => {
      if (row.type === 'income') income = Number(row.total);
      if (row.type === 'expense') expenses = Number(row.total);
    });

    const fixedChargesTotal = Number(fixedChargesResult[0]?.total || 0);

    const saved = Number(savingsResult[0]?.saved || 0);
    const target = Number(savingsResult[0]?.target || 0);
    const progress = target > 0 ? Number(((saved / target) * 100).toFixed(2)) : 0;

    // Total balance up to today
    const totalBalance = Number(balanceResult[0]?.total || 0);

    const data = {
      month: monthYear,
      income,
      expenses,
      balance: totalBalance,
      fixedCharges: fixedChargesTotal,
      savings: {
        saved,
        target,
        progress
      },
      upcomingReminders: remindersResult,
      budget: budgetResult,
      recentTransactions: recentTransactionsResult,
      futureTransactions: futureTransactionsResult
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
