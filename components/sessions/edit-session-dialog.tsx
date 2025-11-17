'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface Session {
  id: number;
  courseId: number;
  subjectId: number;
  platoonId: number;
  instructorId: number;
  plannedAt: string;
  durationMin: number;
  venue: string;
  notes?: string;
}

interface EditSessionDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditSessionDialog({ session, open, onOpenChange, onSuccess }: EditSessionDialogProps) {
  const { csrfToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [platoons, setPlatoons] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    courseId: session.courseId.toString(),
    subjectId: session.subjectId.toString(),
    platoonId: session.platoonId.toString(),
    instructorId: session.instructorId.toString(),
    plannedAt: new Date(session.plannedAt).toISOString().slice(0, 16),
    durationMin: session.durationMin.toString(),
    venue: session.venue,
    notes: session.notes || '',
  });

  useEffect(() => {
    if (open) {
      fetchReferenceData();
      setFormData({
        courseId: session.courseId.toString(),
        subjectId: session.subjectId.toString(),
        platoonId: session.platoonId.toString(),
        instructorId: session.instructorId.toString(),
        plannedAt: new Date(session.plannedAt).toISOString().slice(0, 16),
        durationMin: session.durationMin.toString(),
        venue: session.venue,
        notes: session.notes || '',
      });
    }
  }, [open, session]);

  const fetchReferenceData = async () => {
    try {
      const [coursesRes, subjectsRes, platoonsRes, instructorsRes] = await Promise.all([
        fetch('/api/v1/courses'),
        fetch('/api/v1/subjects'),
        fetch('/api/v1/platoons'),
        fetch('/api/v1/instructors'),
      ]);

      const [coursesData, subjectsData, platoonsData, instructorsData] = await Promise.all([
        coursesRes.json(),
        subjectsRes.json(),
        platoonsRes.json(),
        instructorsRes.json(),
      ]);

      setCourses(coursesData.courses || []);
      setSubjects(subjectsData.subjects || []);
      setPlatoons(platoonsData.platoons || []);
      setInstructors(instructorsData.instructors || []);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/sessions/${session.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({
          courseId: parseInt(formData.courseId),
          subjectId: parseInt(formData.subjectId),
          platoonId: parseInt(formData.platoonId),
          instructorId: parseInt(formData.instructorId),
          plannedAt: formData.plannedAt,
          durationMin: parseInt(formData.durationMin),
          venue: formData.venue,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseId">Course *</Label>
                <Select
                  id="courseId"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <Select
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platoonId">Platoon *</Label>
                <Select
                  id="platoonId"
                  value={formData.platoonId}
                  onChange={(e) => setFormData({ ...formData, platoonId: e.target.value })}
                  required
                >
                  <option value="">Select Platoon</option>
                  {platoons.map((platoon) => (
                    <option key={platoon.id} value={platoon.id}>
                      {platoon.key} - {platoon.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="instructorId">Instructor *</Label>
                <Select
                  id="instructorId"
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  required
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plannedAt">Planned At *</Label>
                <Input
                  id="plannedAt"
                  type="datetime-local"
                  value={formData.plannedAt}
                  onChange={(e) => setFormData({ ...formData, plannedAt: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="durationMin">Duration (minutes) *</Label>
                <Input
                  id="durationMin"
                  type="number"
                  min="1"
                  value={formData.durationMin}
                  onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

