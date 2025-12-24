import { useState } from 'react';
import { format } from 'date-fns';
import { 
  History, 
  Trash2, 
  Eye, 
  FileImage,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RadiologyScan, getScanTypeLabel, getSeverityColor } from '@/lib/radiologyClient';

interface RadiologyHistoryProps {
  scans: RadiologyScan[];
  onViewScan: (scan: RadiologyScan) => void;
  onDeleteScan: (scanId: string) => void;
  isLoading: boolean;
}

export function RadiologyHistory({ scans, onViewScan, onDeleteScan, isLoading }: RadiologyHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (scanId: string) => {
    setDeletingId(scanId);
    await onDeleteScan(scanId);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scan History
          </CardTitle>
          <CardDescription>Your analyzed scans will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No scans analyzed yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload and analyze a radiology image to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Scan History
        </CardTitle>
        <CardDescription>{scans.length} scan{scans.length !== 1 ? 's' : ''} analyzed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scans.map((scan) => {
            // Determine overall severity from findings
            const findings = scan.findings as unknown as Array<{ severity: string }> || [];
            const severities = findings.map(f => f.severity);
            let severity = 'normal';
            if (severities.includes('severe')) severity = 'severe';
            else if (severities.includes('moderate')) severity = 'moderate';
            else if (severities.includes('mild')) severity = 'mild';

            return (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center flex-shrink-0">
                    <FileImage className="h-5 w-5 text-medical-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{scan.file_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getScanTypeLabel(scan.scan_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      <Badge className={`text-xs ${getSeverityColor(severity)}`}>
                        {severity}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewScan(scan)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === scan.id}
                        title="Delete scan"
                      >
                        {deletingId === scan.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Scan Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this scan analysis from your history. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(scan.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
