import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const todos = await sql`
      SELECT * FROM todos 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: todos });
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
    const { title, description } = body;
    // Support both camelCase and snake_case
    const is_completed = body.is_completed ?? body.isCompleted ?? false;

    const result = await sql`
      INSERT INTO todos (user_id, title, description, is_completed)
      VALUES (${userId}, ${title}, ${description}, ${is_completed})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
