import { supabase } from "@/integrations/supabase/client";
import { OCRResult } from "@/types/cbc.types";
import { pdfjs } from 'react-pdf';
import { preprocessImageForOCR, enhanceOCRText } from './ocr-enhancer';

// Initialize PDF.js worker
// Use CDN for PDF.js worker to avoid Vite bundling issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Call Google Cloud Vision OCR via edge function with fallback to local Tesseract
 */
export const callGoogleVisionOCR = async (imageBase64: string): Promise<OCRResult> => {
  console.log('Attempting Google Cloud Vision OCR...');

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const { data, error } = await supabase.functions.invoke('google-vision-ocr', {
      body: { imageBase64: base64Data }
    });

    if (error) {
      console.error('Google Vision OCR error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }

    if (!data.success) {
      console.error('Google Vision OCR failed:', data.error);
      throw new Error(`OCR failed: ${data.error}`);
    }

    console.log('Google Vision OCR completed. Confidence:', data.confidence);

    // Enhance the extracted text
    const enhancedText = enhanceOCRText(data.text);

    return {
      text: enhancedText,
      confidence: data.confidence
    };
  } catch (visionError) {
    // Fallback to local Tesseract.js if Google Vision fails
    console.warn('Google Vision failed, falling back to local Tesseract:', visionError);
    console.log('Starting local Tesseract.js OCR as fallback...');

    // Dynamic import to avoid bundling issues
    const { processImage } = await import('./pdf-processor');
    const result = await processImage(imageBase64);

    console.log('Fallback Tesseract OCR completed. Confidence:', result.confidence);
    return result;
  }
};

/**
 * Convert PDF page to high-quality image for OCR
 */
const convertPdfPageToImage = async (pdfData: ArrayBuffer): Promise<string> => {
  try {
    console.log('Converting PDF to image with high-quality settings...');

    const loadingTask = pdfjs.getDocument({
      data: pdfData,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
      verbosity: 0,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@latest/standard_fonts/'
    });

    const pdf = await loadingTask.promise;
    console.log('PDF loaded. Total pages:', pdf.numPages);

    const page = await pdf.getPage(1);

    // High resolution for better OCR
    const scale = 3.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true
    });

    if (!context) throw new Error('Could not create canvas context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // White background for better OCR
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    console.log(`Rendering PDF at ${viewport.width}x${viewport.height}`);

    await page.render({
      canvasContext: context,
      viewport: viewport,
      intent: 'print'
    }).promise;

    // Apply preprocessing for better OCR accuracy
    const enhancedCanvas = preprocessImageForOCR(canvas);

    return enhancedCanvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Process PDF file using Google Cloud Vision OCR
 */
export const processPDFWithVision = async (file: File): Promise<OCRResult> => {
  console.log('Processing PDF with Google Vision:', file.name);

  const arrayBuffer = await file.arrayBuffer();
  const imageDataUrl = await convertPdfPageToImage(arrayBuffer);

  return await callGoogleVisionOCR(imageDataUrl);
};

/**
 * Process image file using Google Cloud Vision OCR
 */
export const processImageWithVision = async (file: File): Promise<OCRResult> => {
  console.log('Processing image with Google Vision:', file.name);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Load and preprocess image
  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Apply preprocessing
  const enhancedCanvas = preprocessImageForOCR(canvas);
  const enhancedDataUrl = enhancedCanvas.toDataURL('image/png', 1.0);

  return await callGoogleVisionOCR(enhancedDataUrl);
};
