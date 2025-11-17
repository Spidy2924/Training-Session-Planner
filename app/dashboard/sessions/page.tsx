'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionsTable from '@/components/sessions/sessions-table';
import SessionFilters from '@/components/sessions/session-filters';
import CreateSessionDialog from '@/components/sessions/create-session-dialog';
import BulkUploadDialog from '@/components/sessions/bulk-upload-dialog';
import { Plus, Upload, LogOut } from 'lucide-react';

export default function SessionsPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [filters, setFilters] = useState({
    courseId: '',
    platoonId: '',
    instructorId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Sessions</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user.name} ({user.role})
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sessions Management</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SessionFilters filters={filters} onFiltersChange={setFilters} />
            <SessionsTable filters={filters} />
          </CardContent>
        </Card>
      </main>

      <CreateSessionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />
    </div>
  );
}

