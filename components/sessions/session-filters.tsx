'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Course {
  id: number;
  code: string;
  title: string;
}

interface Platoon {
  id: number;
  key: string;
  name: string;
}

interface Instructor {
  id: number;
  name: string;
  email: string;
}

interface SessionFiltersProps {
  filters: {
    courseId: string;
    platoonId: string;
    instructorId: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function SessionFilters({ filters, onFiltersChange }: SessionFiltersProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [coursesRes, platoonsRes, instructorsRes] = await Promise.all([
        fetch('/api/v1/courses'),
        fetch('/api/v1/platoons'),
        fetch('/api/v1/instructors'),
      ]);

      const [coursesData, platoonsData, instructorsData] = await Promise.all([
        coursesRes.json(),
        platoonsRes.json(),
        instructorsRes.json(),
      ]);

      setCourses(coursesData.courses || []);
      setPlatoons(platoonsData.platoons || []);
      setInstructors(instructorsData.instructors || []);
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  const handleReset = () => {
    onFiltersChange({
      courseId: '',
      platoonId: '',
      instructorId: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="courseId">Course</Label>
          <Select
            id="courseId"
            value={filters.courseId}
            onChange={(e) => onFiltersChange({ ...filters, courseId: e.target.value })}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="platoonId">Platoon</Label>
          <Select
            id="platoonId"
            value={filters.platoonId}
            onChange={(e) => onFiltersChange({ ...filters, platoonId: e.target.value })}
          >
            <option value="">All Platoons</option>
            {platoons.map((platoon) => (
              <option key={platoon.id} value={platoon.id}>
                {platoon.key} - {platoon.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="instructorId">Instructor</Label>
          <Select
            id="instructorId"
            value={filters.instructorId}
            onChange={(e) => onFiltersChange({ ...filters, instructorId: e.target.value })}
          >
            <option value="">All Instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

