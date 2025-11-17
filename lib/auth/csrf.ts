import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-key';

export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${timestamp}`)
    .digest('hex');
  
  return `${token}:${timestamp}:${signature}`;
}

export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenPart, timestampStr, signature] = token.split(':');
    const timestamp = parseInt(timestampStr, 10);
    
    // Token expires after 1 hour
    if (Date.now() - timestamp > 3600000) {
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${tokenPart}:${timestamp}`)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

