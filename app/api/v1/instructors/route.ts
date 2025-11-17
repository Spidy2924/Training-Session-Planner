import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { instructors } from '@/lib/db/schema';

export async function GET() {
  try {
    const allInstructors = await db.select().from(instructors).orderBy(instructors.name);
    return NextResponse.json({ instructors: allInstructors });
  } catch (error) {
    console.error('GET instructors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

