/**
 * Custom error types for better type safety
 */

export interface NetworkError extends Error {
  isNetworkError: boolean;
  originalError?: Error;
}

export interface APIError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
  isNetworkError?: boolean;
  message: string;
}
