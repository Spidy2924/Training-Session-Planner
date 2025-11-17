import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './index';
import { users, courses, subjects, instructors, platoons, sessions } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.delete(sessions);
  await db.delete(users);
  await db.delete(courses);
  await db.delete(subjects);
  await db.delete(instructors);
  await db.delete(platoons);

  // Seed Platoons
  const [platoon1, platoon2, platoon3] = await db.insert(platoons).values([
    { key: 'PLT-A', name: 'Alpha Platoon' },
    { key: 'PLT-B', name: 'Bravo Platoon' },
    { key: 'PLT-C', name: 'Charlie Platoon' },
  ]).returning();

  console.log('✅ Platoons seeded');

  // Seed Courses
  const [course1, course2, course3] = await db.insert(courses).values([
    { code: 'CS-101', title: 'Introduction to Computer Science' },
    { code: 'MATH-201', title: 'Advanced Mathematics' },
    { code: 'PHY-101', title: 'Physics Fundamentals' },
  ]).returning();

  console.log('✅ Courses seeded');

  // Seed Subjects
  const [subject1, subject2, subject3, subject4] = await db.insert(subjects).values([
    { code: 'PROG-101', title: 'Programming Basics' },
    { code: 'CALC-201', title: 'Calculus' },
    { code: 'MECH-101', title: 'Mechanics' },
    { code: 'ALGO-301', title: 'Algorithms' },
  ]).returning();

  console.log('✅ Subjects seeded');

  // Seed Instructors
  const [instructor1, instructor2, instructor3] = await db.insert(instructors).values([
    { name: 'Dr. John Smith', email: 'john.smith@example.com' },
    { name: 'Prof. Jane Doe', email: 'jane.doe@example.com' },
    { name: 'Dr. Robert Johnson', email: 'robert.johnson@example.com' },
  ]).returning();

  console.log('✅ Instructors seeded');

  // Seed Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      platoonId: null,
    },
    {
      email: 'platoon.a@example.com',
      password: hashedPassword,
      name: 'Platoon A Manager',
      role: 'platoon_scoped',
      platoonId: platoon1.id,
    },
    {
      email: 'platoon.b@example.com',
      password: hashedPassword,
      name: 'Platoon B Manager',
      role: 'platoon_scoped',
      platoonId: platoon2.id,
    },
  ]);

  console.log('✅ Users seeded (password: password123)');

  // Seed Sessions
  await db.insert(sessions).values([
    {
      courseId: course1.id,
      subjectId: subject1.id,
      platoonId: platoon1.id,
      instructorId: instructor1.id,
      plannedAt: new Date('2025-11-20T09:00:00'),
      durationMin: 90,
      venue: 'Room 101',
      notes: 'Introduction to programming concepts',
    },
    {
      courseId: course1.id,
      subjectId: subject4.id,
      platoonId: platoon1.id,
      instructorId: instructor1.id,
      plannedAt: new Date('2025-11-21T14:00:00'),
      durationMin: 120,
      venue: 'Lab 201',
      notes: 'Hands-on algorithm practice',
    },
    {
      courseId: course2.id,
      subjectId: subject2.id,
      platoonId: platoon2.id,
      instructorId: instructor2.id,
      plannedAt: new Date('2025-11-22T10:00:00'),
      durationMin: 60,
      venue: 'Room 305',
    },
    {
      courseId: course3.id,
      subjectId: subject3.id,
      platoonId: platoon3.id,
      instructorId: instructor3.id,
      plannedAt: new Date('2025-11-23T11:00:00'),
      durationMin: 90,
      venue: 'Physics Lab',
      notes: 'Mechanics experiments',
    },
  ]);

  console.log('✅ Sessions seeded');
  console.log('🎉 Database seeding completed!');
  
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

