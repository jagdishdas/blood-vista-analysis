import { createWorker, PSM, OEM } from 'tesseract.js';
import { OCRResult, ExtractedCBCData, CBCParameter, CBCFormData } from '@/types/cbc.types';
import { pdfjs } from 'react-pdf';
import { preprocessImageForOCR, enhanceOCRText, extractMedicalValues } from './ocr-enhancer';

// Initialize PDF.js with a more reliable worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

// Create an enhanced Tesseract worker for better OCR
const createOCRWorker = async () => {
  console.log('Creating OCR worker...');
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-+:%/ ×³⁶µ',
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
  });
  console.log('OCR worker created and configured');
  return worker;
};

// World standard units - exactly matching reference ranges
const WORLD_STANDARD_UNITS = {
  wbc: '10³/µL',
  rbc: '10⁶/µL',
  platelets: '10³/µL',
  hemoglobin: 'g/dL',
  hematocrit: '%',
  mcv: 'fL',
  mch: 'pg',
  mchc: 'g/dL',
  rdw: '%',
  neutrophils: '%',
  lymphocytes: '%',
  monocytes: '%',
  eosinophils: '%',
  basophils: '%'
};

// Enhanced unit conversion with better pattern recognition
const normalizeToWorldStandard = (value: string, rawUnit: string, parameterId: string): { value: string; unit: string } => {
  console.log(`Normalizing ${parameterId}: value=${value}, rawUnit=${rawUnit}`);
  
  const numericValue = parseFloat(value);
  const standardUnit = WORLD_STANDARD_UNITS[parameterId as keyof typeof WORLD_STANDARD_UNITS];
  
  if (!standardUnit || isNaN(numericValue)) {
    return { value, unit: rawUnit };
  }
  
  let convertedValue = numericValue;
  
  switch (parameterId) {
    case 'wbc':
    case 'platelets':
      // Target: 10³/µL (thousands per microliter)
      if (/cumm|\/mm³|\/mm3/i.test(rawUnit)) {
        convertedValue = numericValue / 1000; // Convert from absolute count
      } else if (/10\^9|×10\^9/i.test(rawUnit)) {
        convertedValue = numericValue; // 10⁹/L is same as 10³/µL
      }
      break;
      
    case 'rbc':
      // Target: 10⁶/µL (millions per microliter)
      if (/mill\/cumm|mill\/mm³/i.test(rawUnit)) {
        convertedValue = numericValue; // Already in millions
      } else if (/10\^12|×10\^12/i.test(rawUnit)) {
        convertedValue = numericValue; // 10¹²/L is same as 10⁶/µL
      }
      break;
      
    case 'hemoglobin':
    case 'mchc':
      // Target: g/dL
      if (/g\/l/i.test(rawUnit)) {
        convertedValue = numericValue / 10; // Convert g/L to g/dL
      }
      break;
      
    case 'hematocrit':
    case 'rdw':
    case 'neutrophils':
    case 'lymphocytes':
    case 'monocytes':
    case 'eosinophils':
    case 'basophils':
      // Target: % (percentage)
      if (numericValue <= 1 && !/%/.test(rawUnit)) {
        convertedValue = numericValue * 100; // Convert decimal to percentage
      }
      break;
  }
  
  const finalValue = convertedValue.toFixed(1);
  console.log(`Converted ${parameterId}: ${value} ${rawUnit} → ${finalValue} ${standardUnit}`);
  
  return { value: finalValue, unit: standardUnit };
};

// Enhanced image processing for better OCR
export const processImage = async (imageDataUrl: string): Promise<OCRResult> => {
  try {
    console.log('Starting image processing...');
    
    // Create a canvas to preprocess the image
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    console.log('Image loaded, dimensions:', img.width, 'x', img.height);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');
    
    // Set canvas size with higher resolution for better OCR
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    
    // Draw and enhance the image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Preprocess for better OCR
    const enhancedCanvas = preprocessImageForOCR(canvas);
    const enhancedDataUrl = enhancedCanvas.toDataURL('image/png');
    
    console.log('Starting enhanced OCR processing...');
    const worker = await createOCRWorker();
    const result = await worker.recognize(enhancedDataUrl);
    console.log('OCR processing complete, confidence:', result.data.confidence);
    console.log('Raw OCR text length:', result.data.text.length);
    await worker.terminate();
    
    // Enhance the extracted text
    const enhancedText = enhanceOCRText(result.data.text);
    console.log('Enhanced text length:', enhancedText.length);
    
    return {
      text: enhancedText,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process the image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced PDF to image conversion with better error handling
const convertPdfPageToImage = async (pdfData: ArrayBuffer): Promise<string> => {
  try {
    console.log('Converting PDF to image...');
    
    // Create a more reliable loading task with proper error handling
    const loadingTask = pdfjs.getDocument({
      data: pdfData,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
      verbosity: 0 // Reduce verbosity to avoid console spam
    });
    
    console.log('Loading PDF document...');
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    const page = await pdf.getPage(1);
    console.log('Got first page');
    
    // Higher scale for better OCR accuracy
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) throw new Error('Could not create canvas context');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    console.log('Rendering PDF page with dimensions:', canvas.width, 'x', canvas.height);
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    console.log('PDF page rendered successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error(`Failed to convert PDF to image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Process the uploaded PDF file and extract text via OCR
export const processPDF = async (file: File): Promise<OCRResult> => {
  try {
    console.log('Processing PDF file:', file.name, file.size, 'bytes');
    
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read PDF file'));
      };
      reader.readAsArrayBuffer(file);
    });
    
    console.log('PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);
    const imageDataUrl = await convertPdfPageToImage(arrayBuffer);
    console.log('PDF converted to image successfully');
    return await processImage(imageDataUrl);
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process the PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Process an uploaded image file and extract text via OCR
export const processImageFile = async (file: File): Promise<OCRResult> => {
  try {
    console.log('Processing image file:', file.name, file.size, 'bytes');
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    console.log('Image file read as DataURL');
    return await processImage(dataUrl);
  } catch (error) {
    console.error('Error processing image file:', error);
    throw new Error(`Failed to process the image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced CBC data extraction using smart pattern matching
export const extractCBCData = (ocrText: string): ExtractedCBCData => {
  console.log('Starting enhanced CBC data extraction...');
  console.log('OCR text to process:', ocrText.substring(0, 1000) + '...');
  
  const extractedData: ExtractedCBCData = {
    parameters: []
  };
  
  // Extract patient information with better patterns
  const nameMatch = ocrText.match(/(?:name|patient)\s*:?\s*([^\n\r]+)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim().replace(/[^\w\s]/g, '');
    if (name.length > 2) {
      extractedData.patientName = name;
      console.log('Extracted patient name:', name);
    }
  }
  
  const ageMatch = ocrText.match(/(?:age|years?|yrs?)\s*:?\s*(\d+)/i);
  if (ageMatch) {
    extractedData.patientAge = parseInt(ageMatch[1]);
    console.log('Extracted patient age:', extractedData.patientAge);
  }
  
  const genderMatch = ocrText.match(/(?:gender|sex)\s*:?\s*(male|female|m|f)\b/i);
  if (genderMatch) {
    const gender = genderMatch[1].toLowerCase();
    extractedData.patientGender = gender.startsWith('f') ? 'female' : 'male';
    console.log('Extracted patient gender:', extractedData.patientGender);
  }
  
  // Use enhanced medical value extraction
  const medicalValues = extractMedicalValues(ocrText);
  console.log('Extracted medical values:', medicalValues);
  
  for (const { parameter, value, unit } of medicalValues) {
    const normalized = normalizeToWorldStandard(value, unit, parameter);
    
    extractedData.parameters.push({
      id: parameter,
      value: normalized.value,
      unit: normalized.unit,
      referenceRange: undefined // Will be set from reference ranges
    });
  }
  
  console.log('Enhanced extraction complete:', extractedData.parameters.length, 'parameters found');
  return extractedData;
};

// Convert the extracted data to the CBCFormData format
export const convertToCBCFormData = (
  extractedData: ExtractedCBCData, 
  existingParameters: CBCParameter[]
): CBCFormData => {
  console.log('Converting extracted data to form data...');
  
  const formData: CBCFormData = {
    patientName: extractedData.patientName || '',
    patientAge: extractedData.patientAge || 0,
    patientGender: extractedData.patientGender || '',
    parameters: JSON.parse(JSON.stringify(existingParameters))
  };
  
  // Update parameters with extracted values
  extractedData.parameters.forEach(extractedParam => {
    const paramIndex = formData.parameters.findIndex(p => p.id === extractedParam.id);
    if (paramIndex !== -1) {
      console.log(`Updating parameter ${extractedParam.id} with value ${extractedParam.value} ${extractedParam.unit}`);
      formData.parameters[paramIndex] = {
        ...formData.parameters[paramIndex],
        value: extractedParam.value,
        unit: extractedParam.unit,
        referenceRange: extractedParam.referenceRange || formData.parameters[paramIndex].referenceRange
      };
    } else {
      console.log(`Parameter ${extractedParam.id} not found in existing parameters`);
    }
  });
  
  console.log('Form data conversion complete');
  return formData;
};
