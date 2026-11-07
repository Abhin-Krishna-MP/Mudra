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

export function getStoredRequests(): StoredRequestInfo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredRequest(req: StoredRequestInfo) {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredRequests().filter((r) => r.token !== req.token);
    list.unshift(req);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Also save in cookie for server awareness
    document.cookie = `mudra_requests=${encodeURIComponent(JSON.stringify(list.map((r) => ({ token: r.token, recordId: r.recordId }))))}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* storage unavailable */
  }
}

