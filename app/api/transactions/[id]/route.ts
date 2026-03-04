import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId}`;

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
    const { amount, category, description, type } = body;
    // Accept both 'date' and 'transaction_date' from frontend
    const transaction_date = body.transaction_date ?? body.date;

    const result = await sql`
      UPDATE transactions 
      SET 
        amount = COALESCE(${amount}, amount),
        category = COALESCE(${category}, category),
        description = COALESCE(${description}, description),
        type = COALESCE(${type}, type),
        transaction_date = COALESCE(${transaction_date}, transaction_date)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
