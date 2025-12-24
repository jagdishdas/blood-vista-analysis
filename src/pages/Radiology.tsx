import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  RadiologyUploader,
  RadiologyAnalyzer,
  RadiologyResults,
  RadiologyHistory,
} from '@/features/radiology';
import {
  ScanType,
  AnalysisResult,
  RadiologyScan,
  RadiologyFinding,
  analyzeRadiologyImage,
  saveScanRecord,
  getUserScans,
  deleteScan,
} from '@/lib/radiologyClient';
import type { User } from '@supabase/supabase-js';

type AnalysisStage = 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';

export default function Radiology() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [currentScanType, setCurrentScanType] = useState<ScanType>('xray');
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [scanHistory, setScanHistory] = useState<RadiologyScan[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedHistoryScan, setSelectedHistoryScan] = useState<RadiologyScan | null>(null);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load scan history
  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setIsHistoryLoading(true);
    try {
      const scans = await getUserScans(user.id);
      setScanHistory(scans);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  // Handle image upload and analysis
  const handleUpload = async (file: File, scanType: ScanType, imageBase64: string) => {
    setError(null);
    setCurrentScanType(scanType);
    setCurrentFileName(file.name);
    setCurrentImagePreview(imageBase64);
    setAnalysisResult(null);
    setSelectedHistoryScan(null);

    try {
      // Stage 1: Uploading/Preparing
      setStage('uploading');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Processing
      setStage('processing');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 3: Analyzing
      setStage('analyzing');
      setProgress(60);

      const result = await analyzeRadiologyImage(imageBase64, scanType, file.name);
      
      setProgress(100);
      setAnalysisResult(result);
      setStage('complete');

      toast({
        title: 'Analysis Complete',
        description: 'Your radiology scan has been analyzed successfully.',
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      setStage('error');
      
      toast({
        title: 'Analysis Failed',
        description: err instanceof Error ? err.message : 'Failed to analyze image',
        variant: 'destructive',
      });
    }
  };

  // Save scan to history
  const handleSave = async () => {
    if (!user || !analysisResult) return;

    setIsSaving(true);
    try {
      await saveScanRecord(
        user.id,
        currentScanType,
        currentFileName,
        null, // We're not storing the actual image for privacy
        analysisResult
      );

      toast({
        title: 'Saved',
        description: 'Scan analysis saved to your history.',
      });

      // Refresh history
      await loadHistory();

      // Reset state
      handleDiscard();
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Failed to save scan',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard current analysis
  const handleDiscard = () => {
    setStage('idle');
    setProgress(0);
    setError(null);
    setAnalysisResult(null);
    setCurrentImagePreview(null);
    setCurrentFileName('');
    setSelectedHistoryScan(null);
  };

  // View scan from history
  const handleViewScan = (scan: RadiologyScan) => {
    setSelectedHistoryScan(scan);
    setStage('idle');
    setAnalysisResult(null);
  };

  // Delete scan from history
  const handleDeleteScan = async (scanId: string) => {
    try {
      await deleteScan(scanId);
      toast({
        title: 'Deleted',
        description: 'Scan removed from history.',
      });
      await loadHistory();
      
      if (selectedHistoryScan?.id === scanId) {
        setSelectedHistoryScan(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Failed to delete scan',
        variant: 'destructive',
      });
    }
  };

  // Auth loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-medical-600 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to use the Radiology AI analysis feature.
              <Button onClick={() => navigate('/auth')} className="ml-4">
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-medical-600 text-white flex items-center justify-center">
                  <Scan className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Radiology AI</h1>
                  <p className="text-sm text-gray-500">Medical Image Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {stage === 'idle' && !selectedHistoryScan && (
              <RadiologyUploader
                onUpload={handleUpload}
                isProcessing={false}
              />
            )}

            {(stage === 'uploading' || stage === 'processing' || stage === 'analyzing') && (
              <RadiologyAnalyzer
                stage={stage}
                progress={progress}
              />
            )}

            {stage === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button 
                    variant="outline" 
                    onClick={handleDiscard} 
                    className="ml-4"
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {stage === 'complete' && analysisResult && (
              <RadiologyResults
                result={analysisResult}
                scanType={currentScanType}
                fileName={currentFileName}
                imagePreview={currentImagePreview || undefined}
                onSave={handleSave}
                onDiscard={handleDiscard}
                isSaving={isSaving}
              />
            )}

            {/* View historical scan */}
            {selectedHistoryScan && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Scan Details</h2>
                  <Button variant="ghost" onClick={() => setSelectedHistoryScan(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Upload
                  </Button>
                </div>
                <RadiologyResults
                  result={{
                    summary: selectedHistoryScan.analysis_summary || '',
                    findings: (selectedHistoryScan.findings as unknown as RadiologyFinding[]) || [],
                    confidenceScore: selectedHistoryScan.confidence_score || 0,
                    provider: selectedHistoryScan.ai_provider || 'unknown',
                    disclaimer: 'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.',
                  }}
                  scanType={selectedHistoryScan.scan_type}
                  fileName={selectedHistoryScan.file_name}
                />
              </div>
            )}
          </div>

          {/* Right Column - History */}
          <div>
            <RadiologyHistory
              scans={scanHistory}
              onViewScan={handleViewScan}
              onDeleteScan={handleDeleteScan}
              isLoading={isHistoryLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
