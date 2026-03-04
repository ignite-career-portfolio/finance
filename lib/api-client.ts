import { getCurrentUserId } from './auth';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const userId = getCurrentUserId();
    const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (userId) {
      headers['x-user-id'] = userId;
    }

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || { message: 'An error occurred' },
        };
      }

      return data;
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An error occurred',
        },
      };
    }
  }

  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
