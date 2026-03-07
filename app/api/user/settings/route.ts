import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await sql`
      SELECT * FROM user_settings WHERE user_id = ${userId}
    `;

        // Initialize default settings if they don't exist
        if (settings.length === 0) {
            const result = await sql`
        INSERT INTO user_settings (user_id) VALUES (${userId})
        RETURNING *
      `;
            settings = result;
        }

        return NextResponse.json({ success: true, data: settings[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { email_notifications, remind_before_default, preferred_currency, theme } = body;

        const result = await sql`
      UPDATE user_settings
      SET 
        email_notifications = COALESCE(${email_notifications}::boolean, email_notifications),
        remind_before_default = COALESCE(${remind_before_default}::integer, remind_before_default),
        preferred_currency = COALESCE(${preferred_currency}, preferred_currency),
        theme = COALESCE(${theme}, theme)
      WHERE user_id = ${userId}
      RETURNING *
    `;

        if (result.length === 0) {
            // If no row updated, try to insert (though GET should have initialized it)
            const insertResult = await sql`
        INSERT INTO user_settings (user_id, email_notifications, remind_before_default, preferred_currency, theme)
        VALUES (${userId}, ${email_notifications}, ${remind_before_default}, ${preferred_currency}, ${theme})
        RETURNING *
      `;
            return NextResponse.json({ success: true, data: insertResult[0] });
        }

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: any) {
        console.error('Settings update error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
