import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { verifyCsrfToken } from './csrf';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getAuthToken(request);
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export function requireAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(request, user);
  };
}

export function requireCsrf(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return requireAuth(async (request: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    const method = request.method;
    
    // Only check CSRF for state-changing methods
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      
      if (!csrfToken || !verifyCsrfToken(csrfToken)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
    
    return handler(request, user);
  });
}

export function requireAdmin(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return requireCsrf(async (request: NextRequest, user: JWTPayload): Promise<NextResponse> => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    return handler(request, user);
  });
}

