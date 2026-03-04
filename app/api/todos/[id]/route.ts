import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await sql`DELETE FROM todos WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Explicitly handle fields to update
    const title = body.hasOwnProperty('title') ? body.title : null;
    const description = body.hasOwnProperty('description') ? body.description : null;
    const is_completed = body.hasOwnProperty('is_completed') ? body.is_completed :
      (body.hasOwnProperty('isCompleted') ? body.isCompleted : null);

    const result = await sql`
      UPDATE todos
      SET
        title = CASE WHEN ${title}::text IS NOT NULL THEN ${title}::text ELSE title END,
        description = CASE WHEN ${description}::text IS NOT NULL THEN ${description}::text ELSE description END,
        is_completed = CASE WHEN ${is_completed}::text IS NOT NULL THEN ${is_completed}::boolean ELSE is_completed END
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('TODO PATCH ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
