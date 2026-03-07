import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendReminderEmail } from '@/lib/mail';

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
    const remind_before_minutes = body.remind_before_minutes ?? body.remindBeforeMinutes ?? 60;
    const is_recurring = body.is_recurring ?? body.isRecurring ?? false;
    const recurrence_interval_hours = body.recurrence_interval_hours ?? body.recurrenceIntervalHours ?? 24;

    const result = await sql`
      INSERT INTO reminders (user_id, title, description, due_date, is_completed, priority, remind_before_minutes, is_recurring, recurrence_interval_hours)
      VALUES (${userId}, ${title}, ${description}, ${due_date}, ${is_completed}, ${priority || 'medium'}, ${remind_before_minutes}, ${is_recurring}, ${recurrence_interval_hours})
      RETURNING *
    `;

    const newReminder = result[0];

    return NextResponse.json({ success: true, data: newReminder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
