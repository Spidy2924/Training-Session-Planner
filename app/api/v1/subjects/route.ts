import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subjects } from '@/lib/db/schema';

export async function GET() {
  try {
    const allSubjects = await db.select().from(subjects).orderBy(subjects.code);
    return NextResponse.json({ subjects: allSubjects });
  } catch (error) {
    console.error('GET subjects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

