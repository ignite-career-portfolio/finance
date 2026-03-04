import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await sql`DELETE FROM reminders WHERE id = ${id} AND user_id = ${userId}`;

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, priority } = body;
    const due_date = body.due_date ?? body.dueDate;
    const is_completed = body.is_completed ?? body.isCompleted;

    const result = await sql`
      UPDATE reminders 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        due_date = COALESCE(${due_date}, due_date),
        is_completed = COALESCE(${is_completed}, is_completed),
        priority = COALESCE(${priority}, priority)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
