import type { ErrorDetail, HttpValidationError } from '../client';
import { API_BASE_URL } from '../constants/config';

type ApiErrorBody = ErrorDetail | HttpValidationError | { detail?: string };

function isNetworkError(message: string) {
  return (
    message.includes('Network request failed') ||
    message.includes('Failed to fetch') ||
    message.includes('Network Error')
  );
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error) {
    if (isNetworkError(error.message)) {
      return `Cannot reach the API at ${API_BASE_URL}. Ensure the backend is running and this URL works from your device.`;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const body = error as ApiErrorBody;

  if ('detail' in body) {
    if (typeof body.detail === 'string') {
      return body.detail;
    }
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail.map((item) => item.msg).join(', ');
    }
  }

  return fallback;
}
