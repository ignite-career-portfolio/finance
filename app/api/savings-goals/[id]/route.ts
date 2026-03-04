import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await sql`DELETE FROM savings_goals WHERE id = ${id} AND user_id = ${userId}`;

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
    const { name, target_amount, current_amount, deadline } = body;

    const result = await sql`
      UPDATE savings_goals 
      SET 
        name = COALESCE(${name}, name),
        target_amount = COALESCE(${target_amount}, target_amount),
        current_amount = COALESCE(${current_amount}, current_amount),
        deadline = COALESCE(${deadline}, deadline)
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
