import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { platoons } from '@/lib/db/schema';

export async function GET() {
  try {
    const allPlatoons = await db.select().from(platoons).orderBy(platoons.key);
    return NextResponse.json({ platoons: allPlatoons });
  } catch (error) {
    console.error('GET platoons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

