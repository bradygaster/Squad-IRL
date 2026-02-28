# Shared utilities for backend and frontend

export const API_BASE = process.env.API_URL || 'http://localhost:5000';

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
