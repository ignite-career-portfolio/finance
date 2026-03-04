import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId} 
      ORDER BY transaction_date DESC 
      LIMIT ${limit}
    `;

    return NextResponse.json({ success: true, data: transactions });
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
    // Frontend sends 'date', DB column is 'transaction_date'
    const { amount, category, description, type } = body;
    const transaction_date = body.transaction_date ?? body.date ?? new Date().toISOString();

    const result = await sql`
      INSERT INTO transactions (user_id, amount, category, description, type, transaction_date)
      VALUES (${userId}, ${amount}, ${category}, ${description}, ${type}, ${transaction_date})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
