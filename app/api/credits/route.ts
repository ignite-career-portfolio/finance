import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await sql`
      SELECT * FROM credits 
      WHERE user_id = ${userId} 
      ORDER BY due_date ASC
    `;

    return NextResponse.json({ success: true, data: credits });
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
    const { name, amount, interest_rate, due_date } = body;

    const result = await sql`
      INSERT INTO credits (user_id, name, amount, interest_rate, due_date)
      VALUES (${userId}, ${name}, ${amount}, ${interest_rate}, ${due_date})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
