import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type ScanType = 'xray' | 'ct' | 'mri';

export interface RadiologyFinding {
  category: string;
  description: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  confidence: number;
}

export interface AnalysisResult {
  summary: string;
  findings: RadiologyFinding[];
  confidenceScore: number;
  provider: string;
  disclaimer: string;
}

export interface RadiologyScan {
  id: string;
  user_id: string;
  scan_type: ScanType;
  file_name: string;
  file_url: string | null;
  analysis_summary: string | null;
  findings: RadiologyFinding[] | null;
  confidence_score: number | null;
  ai_provider: string | null;
  created_at: string;
  updated_at: string;
}

// Supported image file types
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom', // DICOM files
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FILE_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.dcm')) {
    return { 
      valid: false, 
      error: 'Unsupported file type. Please upload JPG, PNG, WebP, or DICOM files.' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File size exceeds 10MB limit. Please compress the image.' 
    };
  }
  
  return { valid: true };
}

// Convert file to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Compress image for upload (reduces quality while maintaining diagnostic utility)
export async function compressImage(base64: string, maxWidth = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Scale down if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with 85% quality for good balance
      const compressed = canvas.toDataURL('image/jpeg', 0.85);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64;
  });
}

// Anonymize image metadata (strip EXIF data by re-encoding)
export async function anonymizeImage(base64: string): Promise<string> {
  // Re-encoding through canvas strips EXIF metadata
  return compressImage(base64);
}

// Determine the API endpoint based on environment
const getRadiologyEndpoint = (): { url: string; useSupabase: boolean } => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return { url: `${apiUrl}/api/radiology`, useSupabase: false };
  }

  // In production builds (e.g. Vercel + custom domains), use same-origin API routes
  if (import.meta.env.PROD) {
    return { url: `/api/radiology`, useSupabase: false };
  }

  // In local dev / Lovable preview, fall back to backend functions
  return {
    url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/radiology-analysis`,
    useSupabase: true,
  };
};

// Call the radiology analysis API
export async function analyzeRadiologyImage(
  imageBase64: string,
  scanType: ScanType,
  fileName: string
): Promise<AnalysisResult> {
  const { url, useSupabase } = getRadiologyEndpoint();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth header for Supabase
  if (useSupabase) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64,
      scanType,
      fileName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Radiology API error:', response.status, errorData);
    throw new Error(errorData.error || 'Failed to analyze image');
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

// Upload image to storage and save scan record
export async function saveScanToStorage(
  userId: string,
  file: File,
  scanType: ScanType
): Promise<string> {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('radiology-scans')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error('Failed to upload scan image');
  }

  const { data: urlData } = supabase.storage
    .from('radiology-scans')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Save scan record to database
export async function saveScanRecord(
  userId: string,
  scanType: ScanType,
  fileName: string,
  fileUrl: string | null,
  analysisResult: AnalysisResult
): Promise<RadiologyScan> {
  const { data, error } = await supabase
    .from('radiology_scans')
    .insert([{
      user_id: userId,
      scan_type: scanType,
      file_name: fileName,
      file_url: fileUrl,
      analysis_summary: analysisResult.summary,
      findings: analysisResult.findings as unknown as Json,
      confidence_score: analysisResult.confidenceScore,
      ai_provider: analysisResult.provider,
    }])
    .select()
    .single();

  if (error) {
    console.error('Database insert error:', error);
    throw new Error('Failed to save scan record');
  }

  return data as unknown as RadiologyScan;
}

// Get user's scan history
export async function getUserScans(userId: string): Promise<RadiologyScan[]> {
  const { data, error } = await supabase
    .from('radiology_scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database query error:', error);
    throw new Error('Failed to fetch scan history');
  }

  return (data || []) as unknown as RadiologyScan[];
}

// Delete a scan record
export async function deleteScan(scanId: string): Promise<void> {
  const { error } = await supabase
    .from('radiology_scans')
    .delete()
    .eq('id', scanId);

  if (error) {
    console.error('Database delete error:', error);
    throw new Error('Failed to delete scan');
  }
}

// Get scan type display name
export function getScanTypeLabel(scanType: ScanType): string {
  const labels: Record<ScanType, string> = {
    xray: 'X-Ray',
    ct: 'CT Scan',
    mri: 'MRI',
  };
  return labels[scanType] || scanType.toUpperCase();
}

// Get severity color class
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    mild: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    moderate: 'text-orange-600 bg-orange-50 border-orange-200',
    severe: 'text-red-600 bg-red-50 border-red-200',
  };
  return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
}
