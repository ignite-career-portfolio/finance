import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await sql`
      SELECT * FROM savings_goals 
      WHERE user_id = ${userId} 
      ORDER BY deadline ASC
    `;

    return NextResponse.json({ success: true, data: goals });
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
    // Support both camelCase (from frontend) and snake_case
    const name = body.name;
    const target_amount = body.target_amount ?? body.targetAmount;
    const current_amount = body.current_amount ?? body.currentAmount ?? 0;
    const deadline = body.deadline;

    const result = await sql`
      INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline)
      VALUES (${userId}, ${name}, ${target_amount}, ${current_amount}, ${deadline})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
