import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, courses, subjects, platoons, instructors } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { requireCsrf } from '@/lib/auth/middleware';
import { createSessionSchema, sessionFilterSchema } from '@/lib/validations/session';

// GET /api/v1/sessions - List sessions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters = sessionFilterSchema.parse({
      courseId: searchParams.get('courseId') || undefined,
      platoonId: searchParams.get('platoonId') || undefined,
      instructorId: searchParams.get('instructorId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });
    
    // Build query conditions
    const conditions = [];
    
    if (filters.courseId) {
      conditions.push(eq(sessions.courseId, parseInt(filters.courseId)));
    }
    
    if (filters.platoonId) {
      conditions.push(eq(sessions.platoonId, parseInt(filters.platoonId)));
    }
    
    if (filters.instructorId) {
      conditions.push(eq(sessions.instructorId, parseInt(filters.instructorId)));
    }
    
    if (filters.startDate) {
      conditions.push(gte(sessions.plannedAt, new Date(filters.startDate)));
    }
    
    if (filters.endDate) {
      conditions.push(lte(sessions.plannedAt, new Date(filters.endDate)));
    }
    
    // Fetch sessions with related data
    const result = await db
      .select({
        id: sessions.id,
        courseId: sessions.courseId,
        subjectId: sessions.subjectId,
        platoonId: sessions.platoonId,
        instructorId: sessions.instructorId,
        plannedAt: sessions.plannedAt,
        durationMin: sessions.durationMin,
        venue: sessions.venue,
        notes: sessions.notes,
        course: {
          id: courses.id,
          code: courses.code,
          title: courses.title,
        },
        subject: {
          id: subjects.id,
          code: subjects.code,
          title: subjects.title,
        },
        platoon: {
          id: platoons.id,
          key: platoons.key,
          name: platoons.name,
        },
        instructor: {
          id: instructors.id,
          name: instructors.name,
          email: instructors.email,
        },
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(subjects, eq(sessions.subjectId, subjects.id))
      .leftJoin(platoons, eq(sessions.platoonId, platoons.id))
      .leftJoin(instructors, eq(sessions.instructorId, instructors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sessions.plannedAt);
    
    return NextResponse.json({ sessions: result });
  } catch (error) {
    console.error('GET sessions error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid filters', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/sessions - Create a new session
export const POST = requireCsrf(async (request, user) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createSessionSchema.parse(body);
    
    // Convert plannedAt to Date if it's a string
    const plannedAt = typeof validatedData.plannedAt === 'string' 
      ? new Date(validatedData.plannedAt) 
      : validatedData.plannedAt;
    
    // Check if user has permission
    if (user.role === 'platoon_scoped' && validatedData.platoonId !== user.platoonId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only create sessions for your platoon' },
        { status: 403 }
      );
    }
    
    // Verify that referenced entities exist
    const [course] = await db.select().from(courses).where(eq(courses.id, validatedData.courseId)).limit(1);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, validatedData.subjectId)).limit(1);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    
    const [platoon] = await db.select().from(platoons).where(eq(platoons.id, validatedData.platoonId)).limit(1);
    if (!platoon) {
      return NextResponse.json({ error: 'Platoon not found' }, { status: 404 });
    }
    
    const [instructor] = await db.select().from(instructors).where(eq(instructors.id, validatedData.instructorId)).limit(1);
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }
    
    // Create session
    const [newSession] = await db.insert(sessions).values({
      ...validatedData,
      plannedAt,
    }).returning();
    
    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('POST session error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

