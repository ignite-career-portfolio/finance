import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendReminderEmail } from '@/lib/mail';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const now = new Date();

        const remindersToNotify = await sql`
      SELECT r.*, u.email as user_email
      FROM reminders r
      JOIN users u ON r.user_id = u.id
      JOIN user_settings us ON r.user_id = us.user_id
      WHERE r.is_completed = false
      AND us.email_notifications = true
      AND (${userId}::text IS NULL OR r.user_id::text = ${userId}::text)
      AND (
        -- Scenario 1: First time reminder (Due date - offset is in the past)
        (r.last_reminded_at IS NULL AND r.due_date - (COALESCE(r.remind_before_minutes, 0) * interval '1 minute') <= NOW())
        OR
        -- Scenario 2: Recurring reminder (Last sent + interval is in the past)
        (
          r.is_recurring = true 
          AND r.last_reminded_at IS NOT NULL 
          AND r.last_reminded_at + (COALESCE(r.recurrence_interval_hours, 24) * interval '1 hour') <= NOW()
          -- Still check if we are within the notification window
          AND r.due_date - (COALESCE(r.remind_before_minutes, 0) * interval '1 minute') <= NOW()
        )
      )
    `;

        const results = [];
        for (const reminder of remindersToNotify) {
            const emailResult = await sendReminderEmail(reminder.user_email, {
                title: reminder.title,
                description: reminder.description,
                dueDate: reminder.due_date,
                priority: reminder.priority
            });

            if (emailResult.success) {
                // Update last_reminded_at
                await sql`
          UPDATE reminders 
          SET last_reminded_at = ${now.toISOString()} 
          WHERE id = ${reminder.id}
        `;
                results.push({ id: reminder.id, status: 'sent' });
            } else {
                results.push({ id: reminder.id, status: 'failed', error: emailResult.error });
            }
        }

        return NextResponse.json({
            success: true,
            processed: remindersToNotify.length,
            details: results
        });
    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
