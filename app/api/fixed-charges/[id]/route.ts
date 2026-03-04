import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await sql`DELETE FROM fixed_charges WHERE id = ${id} AND user_id = ${userId}`;

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, amount, frequency, due_date, type, start_date, end_date } = body;

    const result = await sql`
      UPDATE fixed_charges 
      SET 
        name = COALESCE(${name}, name),
        amount = COALESCE(${amount}, amount),
        frequency = COALESCE(${frequency}, frequency),
        due_date = COALESCE(${due_date}, due_date),
        type = COALESCE(${type}, type),
        start_date = COALESCE(${start_date}, start_date),
        end_date = ${end_date === undefined ? sql`end_date` : end_date}
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
