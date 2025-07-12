import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Safe time formatting for SSR - returns static text initially
export function formatTimeAgoSafe(date: Date): string {
  // Return a static placeholder for SSR
  if (typeof window === 'undefined') {
    return 'recently';
  }
  return formatTimeAgo(date);
}

export function isParticipantActive(lastActivity: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - lastActivity.getTime();
  return diff < 30 * 1000; // 30 seconds
}

export function isSessionExpired(lastActivity: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - lastActivity.getTime();
  return diff > 15 * 60 * 1000; // 15 minutes
} 