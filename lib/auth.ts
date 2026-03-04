import crypto from 'crypto';

export interface AuthResponse {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; data?: AuthResponse; error?: AuthError }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return { success: false, error: responseJson };
    }

    // API wraps response in { success: true, data: { userId, email } }
    const userData = responseJson.data ?? responseJson;

    // Store userId in session storage so API calls work immediately
    if (userData.userId) {
      sessionStorage.setItem('userId', userData.userId);
      sessionStorage.setItem('userEmail', userData.email);
    }

    return { success: true, data: userData };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An error occurred during registration' },
    };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; data?: AuthResponse; error?: AuthError }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();

    if (!response.ok) {
      return { success: false, error: responseJson };
    }

    // API wraps response in { success: true, data: { userId, email } }
    const userData = responseJson.data ?? responseJson;

    // Store userId in session storage for API requests
    if (userData.userId) {
      sessionStorage.setItem('userId', userData.userId);
      sessionStorage.setItem('userEmail', userData.email);
    }

    return { success: true, data: userData };
  } catch (error) {
    return {
      success: false,
      error: { message: 'An error occurred during login' },
    };
  }
}

export function logout(): void {
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userEmail');
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userId');
}

export function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userEmail');
}
