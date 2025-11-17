import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, courses, subjects, platoons, instructors } from '@/lib/db/schema';
import { eq, or, ilike } from 'drizzle-orm';
import { requireCsrf } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface BulkUploadRow {
  course: string;
  subject: string;
  platoon: string;
  instructor: string;
  plannedAt: string;
  durationMin: string;
  venue: string;
  notes?: string;
}

interface BulkUploadError {
  row: number;
  error: string;
}

export const POST = requireCsrf(async (request, user) => {
  try {
    // Rate limiting
    const rateLimitKey = `bulk-upload:${user.userId}`;
    const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 5, windowMs: 60000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetAt: rateLimit.resetAt,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Read file content
    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    let rows: any[] = [];
    
    // Parse based on file type
    if (fileExtension === 'csv') {
      const text = new TextDecoder().decode(buffer);
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rows = parsed.data;
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV or XLSX file.' },
        { status: 400 }
      );
    }
    
    // Normalize column names (case-insensitive)
    const normalizedRows: BulkUploadRow[] = rows.map((row: any) => {
      const normalized: any = {};
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '');
        if (normalizedKey.includes('course')) normalized.course = value;
        else if (normalizedKey.includes('subject')) normalized.subject = value;
        else if (normalizedKey.includes('platoon')) normalized.platoon = value;
        else if (normalizedKey.includes('instructor')) normalized.instructor = value;
        else if (normalizedKey.includes('planned')) normalized.plannedAt = value;
        else if (normalizedKey.includes('duration')) normalized.durationMin = value;
        else if (normalizedKey.includes('venue')) normalized.venue = value;
        else if (normalizedKey.includes('notes')) normalized.notes = value;
      }
      return normalized as BulkUploadRow;
    });
    
    // Process rows
    let successCount = 0;
    const errors: BulkUploadError[] = [];
    
    // Fetch all reference data once
    const allCourses = await db.select().from(courses);
    const allSubjects = await db.select().from(subjects);
    const allPlatoons = await db.select().from(platoons);
    const allInstructors = await db.select().from(instructors);
    
    for (let i = 0; i < normalizedRows.length; i++) {
      const row = normalizedRows[i];
      const rowNumber = i + 2; // +2 because of header and 0-index
      
      try {
        // Validate required fields
        if (!row.course || !row.subject || !row.platoon || !row.instructor || !row.plannedAt || !row.durationMin || !row.venue) {
          errors.push({ row: rowNumber, error: 'Missing required fields' });
          continue;
        }
        
        // Find course
        const course = allCourses.find(c => 
          c.code.toLowerCase() === row.course.toLowerCase() || 
          c.title.toLowerCase() === row.course.toLowerCase()
        );
        if (!course) {
          errors.push({ row: rowNumber, error: `Course not found: ${row.course}` });
          continue;
        }
        
        // Find subject
        const subject = allSubjects.find(s => 
          s.code.toLowerCase() === row.subject.toLowerCase() || 
          s.title.toLowerCase() === row.subject.toLowerCase()
        );
        if (!subject) {
          errors.push({ row: rowNumber, error: `Subject not found: ${row.subject}` });
          continue;
        }
        
        // Find platoon
        const platoon = allPlatoons.find(p => 
          p.key.toLowerCase() === row.platoon.toLowerCase() || 
          p.name.toLowerCase() === row.platoon.toLowerCase()
        );
        if (!platoon) {
          errors.push({ row: rowNumber, error: `Platoon not found: ${row.platoon}` });
          continue;
        }
        
        // Check platoon permission
        if (user.role === 'platoon_scoped' && platoon.id !== user.platoonId) {
          errors.push({ row: rowNumber, error: 'Forbidden: You can only create sessions for your platoon' });
          continue;
        }
        
        // Find instructor
        const instructor = allInstructors.find(inst => 
          inst.name.toLowerCase() === row.instructor.toLowerCase() || 
          inst.email.toLowerCase() === row.instructor.toLowerCase()
        );
        if (!instructor) {
          errors.push({ row: rowNumber, error: `Instructor not found: ${row.instructor}` });
          continue;
        }
        
        // Parse date
        const plannedAt = new Date(row.plannedAt);
        if (isNaN(plannedAt.getTime())) {
          errors.push({ row: rowNumber, error: `Invalid date format: ${row.plannedAt}` });
          continue;
        }
        
        // Parse duration
        const durationMin = parseInt(row.durationMin);
        if (isNaN(durationMin) || durationMin <= 0) {
          errors.push({ row: rowNumber, error: `Invalid duration: ${row.durationMin}` });
          continue;
        }
        
        // Insert session
        await db.insert(sessions).values({
          courseId: course.id,
          subjectId: subject.id,
          platoonId: platoon.id,
          instructorId: instructor.id,
          plannedAt,
          durationMin,
          venue: row.venue,
          notes: row.notes || null,
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push({ 
          row: rowNumber, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return NextResponse.json({
      success: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

