import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { loginSchema } from '@/lib/schemas';
import { validationErrorResponse, successResponse, errorResponse } from '@/lib/api-utils';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const userResult = await sql`
      SELECT id, password FROM users WHERE email = ${validatedData.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json(
        errorResponse('Invalid email or password'),
        { status: 401 }
      );
    }

    const user = userResult[0];
    const passwordHash = hashPassword(validatedData.password);

    if (user.password !== passwordHash) {
      return NextResponse.json(
        errorResponse('Invalid email or password'),
        { status: 401 }
      );
    }

    return NextResponse.json(
      successResponse({ userId: user.id, email: validatedData.email })
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(validationErrorResponse(error as any), { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json(errorResponse('Internal server error'), { status: 500 });
  }
}
