import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, courses, subjects, platoons, instructors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireCsrf } from '@/lib/auth/middleware';
import { updateSessionSchema } from '@/lib/validations/session';

// PATCH /api/v1/sessions/:id - Update a session
export const PATCH = requireCsrf(async (request, user) => {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '');
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = updateSessionSchema.parse(body);
    
    // Get existing session
    const [existingSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);
    
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Check permissions
    if (user.role === 'platoon_scoped') {
      if (existingSession.platoonId !== user.platoonId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update sessions for your platoon' },
          { status: 403 }
        );
      }
      
      // If trying to change platoon, ensure it's still their platoon
      if (validatedData.platoonId && validatedData.platoonId !== user.platoonId) {
        return NextResponse.json(
          { error: 'Forbidden: You cannot change session to a different platoon' },
          { status: 403 }
        );
      }
    }
    
    // Verify referenced entities if they're being updated
    if (validatedData.courseId) {
      const [course] = await db.select().from(courses).where(eq(courses.id, validatedData.courseId)).limit(1);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
    }
    
    if (validatedData.subjectId) {
      const [subject] = await db.select().from(subjects).where(eq(subjects.id, validatedData.subjectId)).limit(1);
      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }
    }
    
    if (validatedData.platoonId) {
      const [platoon] = await db.select().from(platoons).where(eq(platoons.id, validatedData.platoonId)).limit(1);
      if (!platoon) {
        return NextResponse.json({ error: 'Platoon not found' }, { status: 404 });
      }
    }
    
    if (validatedData.instructorId) {
      const [instructor] = await db.select().from(instructors).where(eq(instructors.id, validatedData.instructorId)).limit(1);
      if (!instructor) {
        return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
      }
    }
    
    // Convert plannedAt to Date if it's a string
    const updateData = { ...validatedData };
    if (updateData.plannedAt) {
      updateData.plannedAt = typeof updateData.plannedAt === 'string' 
        ? new Date(updateData.plannedAt) 
        : updateData.plannedAt;
    }
    
    // Update session
    const [updatedSession] = await db
      .update(sessions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, id))
      .returning();
    
    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('PATCH session error:', error);
    
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

// DELETE /api/v1/sessions/:id - Delete a session
export const DELETE = requireCsrf(async (request, user) => {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '');
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }
    
    // Get existing session
    const [existingSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);
    
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Check permissions
    if (user.role === 'platoon_scoped' && existingSession.platoonId !== user.platoonId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete sessions for your platoon' },
        { status: 403 }
      );
    }
    
    // Delete session
    await db.delete(sessions).where(eq(sessions.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE session error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

