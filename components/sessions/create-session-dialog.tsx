'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, BookOpen, GraduationCap, User, FileText } from 'lucide-react';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const { csrfToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [platoons, setPlatoons] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    platoonId: '',
    instructorId: '',
    plannedAt: '',
    durationMin: '',
    venue: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchReferenceData();
    }
  }, [open]);

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
      const response = await fetch('/api/v1/sessions', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to create session');
      }

      // Reset form and close dialog
      setFormData({
        courseId: '',
        subjectId: '',
        platoonId: '',
        instructorId: '',
        plannedAt: '',
        durationMin: '',
        venue: '',
        notes: '',
      });
      onOpenChange(false);
      window.location.reload(); // Refresh to show new session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Training Session</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to schedule a new training session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course & Subject Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 border-b pb-2">
              <BookOpen className="h-4 w-4" />
              <span>Course Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseId" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Course <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="courseId"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                  className="bg-card"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                  className="bg-card"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Platoon & Instructor Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 border-b pb-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platoonId" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Platoon <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="platoonId"
                  value={formData.platoonId}
                  onChange={(e) => setFormData({ ...formData, platoonId: e.target.value })}
                  required
                  className="bg-card"
                >
                  <option value="">Select a platoon</option>
                  {platoons.map((platoon) => (
                    <option key={platoon.id} value={platoon.id}>
                      {platoon.key} - {platoon.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorId" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Instructor <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="instructorId"
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  required
                  className="bg-card"
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 border-b pb-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedAt" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date & Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="plannedAt"
                  type="datetime-local"
                  value={formData.plannedAt}
                  onChange={(e) => setFormData({ ...formData, plannedAt: e.target.value })}
                  required
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMin" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Duration (minutes) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="durationMin"
                  type="number"
                  min="1"
                  placeholder="e.g., 90"
                  value={formData.durationMin}
                  onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                  required
                  className="bg-card"
                />
              </div>
            </div>
          </div>

          {/* Location & Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 border-b pb-2">
              <MapPin className="h-4 w-4" />
              <span>Additional Details</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Venue <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g., Room 101, Lab 201"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any additional notes or instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <svg className="h-5 w-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Error creating session</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

