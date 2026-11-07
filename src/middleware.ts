import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept requests targeting image upload directory (e.g., /uploads/)
  if (pathname.startsWith('/uploads/')) {
    const response = NextResponse.next();
    response.headers.set('tdm-reservation', '1');
    response.headers.set('tdm-policy', '/developers#tdm-policy');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/uploads/:path*'],
};
