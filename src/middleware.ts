import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, sessionSecret } from '@/lib/session-secret';
import { canSubmit } from '@/lib/authorRoles';

/**
 * Gate 1 for /submit: a real HTTP 307 to the login page unless the request carries a validly signed
 * session whose role is `author`.
 * Gate for /uploads/: attaches the official W3C TDMRep header tdm-reservation: 1.
 */
const b64uToBytes = (v: string) => Uint8Array.from(atob(v.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function authorSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [body, mac] = token.split('.');
  if (!body || !mac) return false;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(sessionSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    if (!(await crypto.subtle.verify('HMAC', key, b64uToBytes(mac), new TextEncoder().encode(body)))) return false;
    const d = JSON.parse(new TextDecoder().decode(b64uToBytes(body)));
    return d.exp > Date.now() && canSubmit(d.role);
  } catch { return false; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Step 4: AI Shield (TDMRep Protocol) - attach tdm-reservation: 1 on image upload requests
  if (pathname.startsWith('/uploads/')) {
    const response = NextResponse.next();
    response.headers.set('tdm-reservation', '1');
    response.headers.set('tdm-policy', '/developers#tdm-policy');
    return response;
  }

  // Step 1: Secure Author Submissions - intercept requests to /submit
  if (pathname === '/submit' || pathname.startsWith('/submit/')) {
    if (await authorSession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '?msg=Unauthorized';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/uploads/:path*', '/submit', '/submit/:path*'],
};
