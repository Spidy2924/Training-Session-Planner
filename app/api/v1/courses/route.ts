import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';

export async function GET() {
  try {
    const allCourses = await db.select().from(courses).orderBy(courses.code);
    return NextResponse.json({ courses: allCourses });
  } catch (error) {
    console.error('GET courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

