'use client';

export interface StoredRequestInfo {
  token: string;
  requestId: string;
  recordId: string;
  recordTitle?: string;
  useKey: string;
  requesterName?: string;
  whatYouWillMake?: string;
  whereAndHowLong?: string;
  createdAt: string;
}

const STORAGE_KEY = 'mudra_requests';

/**
 * Ephemeral session requirement:
 * Requests are NOT stored persistently across browser reloads or for public viewing.
 * A person must use their private token code to view their request.
 * This clears any legacy requests previously left in storage or cookies.
 */
export function clearLegacyStoredRequests() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/**
 * Deprecated stubs to preserve interface compatibility:
 * Always returns empty array per ephemeral privacy requirement.
 */
export function getStoredRequests(): StoredRequestInfo[] {
  return [];
}

export function saveStoredRequest(_req: StoredRequestInfo) {
  // Intentionally no-op per ephemeral policy
}
