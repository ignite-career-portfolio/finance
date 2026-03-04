import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const reminders = await sql`
      SELECT * FROM reminders 
      WHERE user_id = ${userId} 
      ORDER BY due_date ASC
    `;

    return NextResponse.json({ success: true, data: reminders });
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
    const { title, description, priority } = body;
    // Support both camelCase (from frontend) and snake_case
    const due_date = body.due_date ?? body.dueDate;
    const is_completed = body.is_completed ?? body.isCompleted ?? false;

    const result = await sql`
      INSERT INTO reminders (user_id, title, description, due_date, is_completed, priority)
      VALUES (${userId}, ${title}, ${description}, ${due_date}, ${is_completed}, ${priority || 'medium'})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
