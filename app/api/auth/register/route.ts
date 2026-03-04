import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createUserSchema } from '@/lib/schemas';
import { validationErrorResponse, successResponse, errorResponse } from '@/lib/api-utils';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${validatedData.email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        errorResponse('Email already in use'),
        { status: 409 }
      );
    }

    const userId = uuidv4();
    const passwordHash = hashPassword(validatedData.password);
    const now = new Date();

    await sql`
      INSERT INTO users (id, name, email, password, created_at)
      VALUES (${userId}, ${validatedData.name}, ${validatedData.email}, ${passwordHash}, ${now})
    `;

    return NextResponse.json(
      successResponse({ userId, email: validatedData.email }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(validationErrorResponse(error as any), { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json(errorResponse('Internal server error'), { status: 500 });
  }
}
