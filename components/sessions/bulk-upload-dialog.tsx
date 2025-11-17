'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const { csrfToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    // Generate preview
    if (selectedFile.name.endsWith('.csv')) {
      const text = await selectedFile.text();
      Papa.parse(text, {
        header: true,
        preview: 5,
        complete: (results) => {
          setPreview(results.data);
        },
      });
    } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      // For XLSX, we'll just show a message
      setPreview([{ message: 'XLSX file selected. Preview not available.' }]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/sessions/bulk-upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken || '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    onOpenChange(false);
    if (result && result.success > 0) {
      window.location.reload(); // Refresh to show new sessions
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Sessions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="file">Upload CSV or XLSX File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Required columns: Course, Subject, Platoon, Instructor, Planned At, Duration (min), Venue, Notes (optional)
            </p>
          </div>

          {preview.length > 0 && !result && (
            <div>
              <h4 className="font-semibold mb-2">Preview (first 5 rows):</h4>
              <div className="border rounded overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="px-3 py-2">
                            {value?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-800">
                  ✓ Successfully created {result.success} session(s)
                </p>
              </div>

              {result.failed > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="font-semibold text-red-800 mb-2">
                    ✗ Failed to create {result.failed} session(s)
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((error, idx) => (
                      <p key={idx} className="text-sm text-red-700">
                        Row {error.row}: {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold mb-2">Sample CSV Format:</p>
            <pre className="text-xs overflow-x-auto">
{`Course,Subject,Platoon,Instructor,Planned At,Duration (min),Venue,Notes
CS-101,PROG-101,PLT-A,john.smith@example.com,2025-11-25T09:00:00,90,Room 101,Introduction
MATH-201,CALC-201,PLT-B,jane.doe@example.com,2025-11-26T14:00:00,60,Room 305,`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

