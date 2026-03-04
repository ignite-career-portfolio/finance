import { ZodError } from 'zod';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string): ApiResponse<null> {
  return { success: false, error };
}

export function validationErrorResponse(error: ZodError): ApiResponse<null> {
  const errors: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  return { success: false, error: 'Validation failed', errors };
}

export function unauthorizedResponse(): ApiResponse<null> {
  return { success: false, error: 'Unauthorized' };
}

export function notFoundResponse(): ApiResponse<null> {
  return { success: false, error: 'Not found' };
}
