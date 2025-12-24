import { createWorker, PSM, OEM } from 'tesseract.js';
import { OCRResult, ExtractedCBCData, CBCParameter, CBCFormData } from '@/types/cbc.types';
import { pdfjs } from 'react-pdf';
import { preprocessImageForOCR, enhanceOCRText, extractMedicalValues } from './ocr-enhancer';
import { ExtractedBloodTestData, BloodTestParameter, BloodTestFormData } from '@/types/blood-test.types';

// Use CDN for PDF.js worker to avoid Vite bundling issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Create OCR worker with enhanced settings for medical reports
const createOCRWorker = async (): Promise<Tesseract.Worker> => {
  console.log('Creating enhanced OCR worker...');
  const worker = await createWorker('eng', OEM.LSTM_ONLY, {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round((m.progress || 0) * 100)}%`);
      }
    }
  });
  
  // Optimized parameters for medical documents
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,-/:()%×µ³⁶ ',
    tessedit_pageseg_mode: PSM.AUTO,
    tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
    preserve_interword_spaces: '1',
  });
  
  console.log('OCR worker created and configured');
  return worker;
};

// Multi-pass OCR strategy for maximum accuracy
const performMultiPassOCR = async (imageDataUrl: string): Promise<{text: string, confidence: number}> => {
  console.log('Starting multi-pass OCR...');
  const results: Array<{text: string, confidence: number}> = [];
  
  // Pass 1: AUTO mode (best for general documents)
  const worker1 = await createOCRWorker();
  await worker1.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  const result1 = await worker1.recognize(imageDataUrl);
  results.push({ text: result1.data.text, confidence: result1.data.confidence });
  await worker1.terminate();
  console.log('Pass 1 complete (AUTO mode):', result1.data.confidence.toFixed(2) + '%');
  
  // Pass 2: SPARSE_TEXT mode (good for tables/forms)
  const worker2 = await createOCRWorker();
  await worker2.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
  const result2 = await worker2.recognize(imageDataUrl);
  results.push({ text: result2.data.text, confidence: result2.data.confidence });
  await worker2.terminate();
  console.log('Pass 2 complete (SPARSE mode):', result2.data.confidence.toFixed(2) + '%');
  
  // Return best result by confidence
  const best = results.reduce((prev, curr) => 
    curr.confidence > prev.confidence ? curr : prev
  );
  
  console.log(`Multi-pass OCR complete. Selected best: ${best.confidence.toFixed(2)}%`);
  return best;
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

// Enhanced image processing with advanced OCR pipeline
export const processImage = async (imageDataUrl: string): Promise<OCRResult> => {
  try {
    console.log('Starting advanced image processing pipeline...');
    
    // Load image
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
    
    // Set canvas to original size first
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Apply advanced preprocessing
    console.log('Applying advanced preprocessing...');
    const enhancedCanvas = preprocessImageForOCR(canvas);
    const enhancedDataUrl = enhancedCanvas.toDataURL('image/png', 1.0);
    
    // Perform multi-pass OCR for best accuracy
    console.log('Starting multi-pass OCR recognition...');
    const ocrResult = await performMultiPassOCR(enhancedDataUrl);
    
    console.log('OCR processing complete. Confidence:', ocrResult.confidence.toFixed(2) + '%');
    console.log('Raw OCR text length:', ocrResult.text.length);
    
    // Enhance the extracted text with advanced corrections
    const enhancedText = enhanceOCRText(ocrResult.text);
    console.log('Enhanced text length:', enhancedText.length);
    
    return {
      text: enhancedText,
      confidence: ocrResult.confidence,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process the image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Convert PDF page to image with maximum quality for OCR
const convertPdfPageToImage = async (pdfData: ArrayBuffer): Promise<string> => {
  try {
    console.log('Converting PDF to image with high-quality settings...');
    
    // Create loading task with enhanced configuration
    const loadingTask = pdfjs.getDocument({
      data: pdfData,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
      verbosity: 0, // Reduce console spam
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@latest/standard_fonts/'
    });
    
    console.log('Loading PDF document...');
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully. Total pages:', pdf.numPages);
    
    const page = await pdf.getPage(1);
    console.log('First page loaded');
    
    // Maximum scale for OCR accuracy (4x higher resolution)
    const scale = 4.0;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
      alpha: false, // Better performance
      willReadFrequently: true
    });
    
    if (!context) throw new Error('Could not create canvas context');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Fill white background (improves OCR)
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log(`Rendering PDF page at ${viewport.width}x${viewport.height} (${scale}x scale)`);
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
      intent: 'print' // Use print quality
    }).promise;
    
    console.log('PDF page rendered successfully at maximum quality');
    
    return canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
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

// Enhanced blood test data extraction using smart pattern matching
export const extractBloodTestData = (ocrText: string, testType: 'lipid' | 'glucose' | 'thyroid'): ExtractedBloodTestData => {
  console.log(`Starting enhanced ${testType} data extraction...`);
  console.log('OCR text to process:', ocrText.substring(0, 1000) + '...');
  
  const extractedData: ExtractedBloodTestData = {
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
  
  // Set test type
  extractedData.testType = testType;
  
  // Test-specific parameter extraction
  const medicalValues = extractMedicalValuesForTest(ocrText, testType);
  console.log('Extracted medical values:', medicalValues);
  
  for (const { parameter, value, unit } of medicalValues) {
    const normalized = normalizeToInternationalStandard(value, unit, parameter, testType);
    
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

// Test-specific medical value extraction
const extractMedicalValuesForTest = (text: string, testType: 'lipid' | 'glucose' | 'thyroid'): Array<{ parameter: string; value: string; unit: string }> => {
  const results: Array<{ parameter: string; value: string; unit: string }> = [];
  
  const patterns = {
    lipid: {
      totalCholesterol: /(?:total\s*cholesterol|cholesterol\s*total|total\s*chol)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi,
      ldlCholesterol: /(?:ldl|low\s*density\s*lipoprotein|ldl\s*cholesterol)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi,
      hdlCholesterol: /(?:hdl|high\s*density\s*lipoprotein|hdl\s*cholesterol)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi,
      triglycerides: /(?:triglycerides?|tg|trigs?)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi
    },
    glucose: {
      fastingGlucose: /(?:fasting\s*glucose|glucose\s*fasting|fbg|fbs)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi,
      randomGlucose: /(?:random\s*glucose|glucose\s*random|rbs|rbg)\s*:?\s*([\d.]+)\s*(mg\/dl|mmol\/l|mg%)/gi,
      hba1c: /(?:hba1c|hb\s*a1c|glycated\s*hemoglobin|hemoglobin\s*a1c)\s*:?\s*([\d.]+)\s*(%|mmol\/mol)/gi
    },
    thyroid: {
      tsh: /(?:tsh|thyroid\s*stimulating\s*hormone)\s*:?\s*([\d.]+)\s*(miu\/l|uiu\/ml|mlu\/l)/gi,
      freeT4: /(?:free\s*t4|ft4|free\s*thyroxine)\s*:?\s*([\d.]+)\s*(ng\/dl|pmol\/l|pg\/ml)/gi,
      freeT3: /(?:free\s*t3|ft3|free\s*triiodothyronine)\s*:?\s*([\d.]+)\s*(ng\/dl|pmol\/l|pg\/ml)/gi,
      totalT4: /(?:total\s*t4|t4\s*total|thyroxine\s*total)\s*:?\s*([\d.]+)\s*(ug\/dl|nmol\/l|mcg\/dl)/gi,
      totalT3: /(?:total\s*t3|t3\s*total|triiodothyronine\s*total)\s*:?\s*([\d.]+)\s*(ng\/dl|nmol\/l|ng\/ml)/gi
    }
  };
  
  const testPatterns = patterns[testType];
  
  for (const [parameter, pattern] of Object.entries(testPatterns)) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      results.push({
        parameter,
        value: match[1],
        unit: match[2].toLowerCase()
      });
      console.log(`Found ${parameter}: ${match[1]} ${match[2]}`);
    }
  }
  
  return results;
};

// International standard units for different test types
const INTERNATIONAL_STANDARD_UNITS = {
  lipid: {
    totalCholesterol: 'mg/dL',
    ldlCholesterol: 'mg/dL',
    hdlCholesterol: 'mg/dL',
    triglycerides: 'mg/dL'
  },
  glucose: {
    fastingGlucose: 'mg/dL',
    randomGlucose: 'mg/dL',
    hba1c: '%'
  },
  thyroid: {
    tsh: 'mIU/L',
    freeT4: 'ng/dL',
    freeT3: 'pg/mL',
    totalT4: 'μg/dL',
    totalT3: 'ng/dL'
  }
};

// Enhanced unit conversion with test-specific handling
const normalizeToInternationalStandard = (value: string, rawUnit: string, parameterId: string, testType: 'lipid' | 'glucose' | 'thyroid'): { value: string; unit: string } => {
  console.log(`Normalizing ${parameterId}: value=${value}, rawUnit=${rawUnit}`);
  
  const numericValue = parseFloat(value);
  const standardUnit = INTERNATIONAL_STANDARD_UNITS[testType][parameterId as keyof typeof INTERNATIONAL_STANDARD_UNITS[typeof testType]];
  
  if (!standardUnit || isNaN(numericValue)) {
    return { value, unit: rawUnit };
  }
  
  let convertedValue = numericValue;
  
  // Test-specific conversions
  if (testType === 'lipid') {
    // Convert mmol/L to mg/dL for lipid parameters
    if (/mmol\/l/i.test(rawUnit)) {
      if (parameterId === 'totalCholesterol' || parameterId === 'ldlCholesterol' || parameterId === 'hdlCholesterol') {
        convertedValue = numericValue * 38.67; // mmol/L to mg/dL for cholesterol
      } else if (parameterId === 'triglycerides') {
        convertedValue = numericValue * 88.57; // mmol/L to mg/dL for triglycerides
      }
    }
  } else if (testType === 'glucose') {
    // Convert mmol/L to mg/dL for glucose
    if (/mmol\/l/i.test(rawUnit) && (parameterId === 'fastingGlucose' || parameterId === 'randomGlucose')) {
      convertedValue = numericValue * 18.0; // mmol/L to mg/dL for glucose
    }
    // HbA1c conversions
    if (parameterId === 'hba1c' && /mmol\/mol/i.test(rawUnit)) {
      convertedValue = (numericValue + 46.7) / 10.929; // mmol/mol to %
    }
  } else if (testType === 'thyroid') {
    // Thyroid hormone conversions
    if (parameterId === 'freeT4') {
      if (/pmol\/l/i.test(rawUnit)) {
        convertedValue = numericValue / 12.87; // pmol/L to ng/dL
      } else if (/pg\/ml/i.test(rawUnit)) {
        convertedValue = numericValue / 10; // pg/mL to ng/dL
      }
    } else if (parameterId === 'freeT3') {
      if (/pmol\/l/i.test(rawUnit)) {
        convertedValue = numericValue / 1.54; // pmol/L to pg/mL
      } else if (/ng\/dl/i.test(rawUnit)) {
        convertedValue = numericValue * 10; // ng/dL to pg/mL
      }
    }
  }
  
  const finalValue = convertedValue.toFixed(parameterId === 'hba1c' ? 1 : 0);
  console.log(`Converted ${parameterId}: ${value} ${rawUnit} → ${finalValue} ${standardUnit}`);
  
  return { value: finalValue, unit: standardUnit };
};

// Convert the extracted data to the BloodTestFormData format
export const convertToBloodTestFormData = (
  extractedData: ExtractedBloodTestData, 
  existingParameters: BloodTestParameter[],
  testType: 'lipid' | 'glucose' | 'thyroid'
): BloodTestFormData => {
  console.log('Converting extracted data to blood test form data...');
  
  const formData: BloodTestFormData = {
    patientName: extractedData.patientName || '',
    patientAge: extractedData.patientAge || 0,
    patientGender: extractedData.patientGender || '',
    testType,
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
  
  console.log('Blood test form data conversion complete');
  return formData;
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
