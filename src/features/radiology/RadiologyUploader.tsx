import { useState, useCallback } from 'react';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ScanType, 
  validateFile, 
  fileToBase64, 
  compressImage, 
  getScanTypeLabel 
} from '@/lib/radiologyClient';

interface RadiologyUploaderProps {
  onUpload: (file: File, scanType: ScanType, imageBase64: string) => void;
  isProcessing: boolean;
}

export function RadiologyUploader({ onUpload, isProcessing }: RadiologyUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>('xray');
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
      setSelectedFile(file);
    } catch (err) {
      setError('Failed to read file');
      console.error(err);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !previewUrl) return;
    
    try {
      // Compress and anonymize the image
      const processedBase64 = await compressImage(previewUrl);
      onUpload(selectedFile, scanType, processedBase64);
    } catch (err) {
      setError('Failed to process image');
      console.error(err);
    }
  }, [selectedFile, previewUrl, scanType, onUpload]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5 text-medical-600" />
          Upload Radiology Image
        </CardTitle>
        <CardDescription>
          Upload an X-ray, CT scan, or MRI image for AI-assisted analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scan Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Scan Type</label>
          <Select value={scanType} onValueChange={(v) => setScanType(v as ScanType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select scan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xray">{getScanTypeLabel('xray')}</SelectItem>
              <SelectItem value="ct">{getScanTypeLabel('ct')}</SelectItem>
              <SelectItem value="mri">{getScanTypeLabel('mri')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Area */}
        {!previewUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragActive 
                ? 'border-medical-500 bg-medical-50' 
                : 'border-gray-300 hover:border-medical-400 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.dcm"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your scan image, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports JPG, PNG, WebP, DICOM (max 10MB)
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Scan preview"
              className="w-full h-64 object-contain bg-black rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analyze Button */}
        {previewUrl && (
          <Button
            onClick={handleAnalyze}
            disabled={isProcessing || !selectedFile}
            className="w-full bg-medical-600 hover:bg-medical-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </Button>
        )}

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your images are processed securely and not stored permanently unless you choose to save the results.
        </p>
      </CardContent>
    </Card>
  );
}
