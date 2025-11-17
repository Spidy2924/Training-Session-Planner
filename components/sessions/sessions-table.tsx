'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import EditSessionDialog from './edit-session-dialog';

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
  course: { id: number; code: string; title: string };
  subject: { id: number; code: string; title: string };
  platoon: { id: number; key: string; name: string };
  instructor: { id: number; name: string; email: string };
}

interface SessionsTableProps {
  filters: {
    courseId: string;
    platoonId: string;
    instructorId: string;
    startDate: string;
    endDate: string;
  };
}

export default function SessionsTable({ filters }: SessionsTableProps) {
  const { csrfToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.platoonId) params.append('platoonId', filters.platoonId);
      if (filters.instructorId) params.append('instructorId', filters.instructorId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/v1/sessions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken || '',
        },
      });

      if (response.ok) {
        fetchSessions();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No sessions found</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Platoon</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Planned At</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="font-medium">{session.course.code}</div>
                <div className="text-sm text-gray-500">{session.course.title}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{session.subject.code}</div>
                <div className="text-sm text-gray-500">{session.subject.title}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{session.platoon.key}</div>
                <div className="text-sm text-gray-500">{session.platoon.name}</div>
              </TableCell>
              <TableCell>{session.instructor.name}</TableCell>
              <TableCell>{formatDateTime(session.plannedAt)}</TableCell>
              <TableCell>{session.durationMin} min</TableCell>
              <TableCell>{session.venue}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSession(session)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
          onSuccess={fetchSessions}
        />
      )}
    </>
  );
}

