import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('month_year');

    let budget;
    if (monthYear) {
      budget = await sql`
        SELECT 
          b.*,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as spent
        FROM budget b
        LEFT JOIN transactions t ON 
          LOWER(b.category) = LOWER(t.category) AND 
          b.user_id = t.user_id AND 
          TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month_year
        WHERE b.user_id = ${userId} AND b.month_year = ${monthYear}
        GROUP BY b.id
      `;
    } else {
      budget = await sql`
        SELECT 
          b.*,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as spent
        FROM budget b
        LEFT JOIN transactions t ON 
          LOWER(b.category) = LOWER(t.category) AND 
          b.user_id = t.user_id AND 
          TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month_year
        WHERE b.user_id = ${userId}
        GROUP BY b.id
      `;
    }

    return NextResponse.json({ success: true, data: budget });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category } = body;
    // Frontend sends 'limit', DB column is 'budgeted_amount'
    const budgeted_amount = body.budgeted_amount ?? body.limit;
    // Auto-set current month_year if not provided
    const month_year = body.month_year ?? new Date().toISOString().slice(0, 7);

    const result = await sql`
      INSERT INTO budget (user_id, category, budgeted_amount, month_year)
      VALUES (${userId}, ${category}, ${budgeted_amount}, ${month_year})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
