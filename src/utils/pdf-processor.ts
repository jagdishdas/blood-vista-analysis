
import { createWorker } from 'tesseract.js';
import { OCRResult, ExtractedCBCData, CBCParameter, CBCFormData } from '@/types/cbc.types';
import { pdfjs } from 'react-pdf';

// Initialize PDF.js with a direct path to the worker with specific version to avoid runtime errors
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Create a Tesseract worker for OCR processing
const createOCRWorker = async () => {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-+:%/ ×',
  });
  return worker;
};

// World standard unit conversions and normalization
const WORLD_STANDARD_UNITS = {
  wbc: '10³/µL',        // World standard: thousands per microliter
  rbc: '10⁶/µL',        // World standard: millions per microliter  
  platelets: '10³/µL',  // World standard: thousands per microliter
  hemoglobin: 'g/dL',   // World standard: grams per deciliter
  hematocrit: '%',      // World standard: percentage
  mcv: 'fL',           // World standard: femtoliters
  mch: 'pg',           // World standard: picograms
  mchc: 'g/dL',        // World standard: grams per deciliter
  rdw: '%',            // World standard: percentage
  neutrophils: '%',    // World standard: percentage
  lymphocytes: '%',    // World standard: percentage
  monocytes: '%',      // World standard: percentage
  eosinophils: '%',    // World standard: percentage
  basophils: '%'       // World standard: percentage
};

// Convert various exponential formats to world standard
const normalizeToWorldStandard = (value: string, rawUnit: string, parameterId: string): { value: string; unit: string } => {
  console.log(`Normalizing ${parameterId}: value=${value}, rawUnit=${rawUnit}`);
  
  const numericValue = parseFloat(value);
  const standardUnit = WORLD_STANDARD_UNITS[parameterId as keyof typeof WORLD_STANDARD_UNITS];
  
  if (!standardUnit) {
    return { value, unit: rawUnit };
  }
  
  // Handle different input formats and convert to world standard
  switch (parameterId) {
    case 'wbc':
    case 'platelets':
      // Target: 10³/µL (thousands per microliter)
      if (/10\^3|k\/|×10\^3|10³/i.test(rawUnit)) {
        // Already in 10³/µL format
        return { value: numericValue.toString(), unit: '10³/µL' };
      } else if (/cumm|\/mm3|\/mm³/i.test(rawUnit)) {
        // Convert from absolute count to 10³/µL
        const convertedValue = (numericValue / 1000).toFixed(1);
        return { value: convertedValue, unit: '10³/µL' };
      } else if (/10\^9|×10\^9/i.test(rawUnit)) {
        // Convert from 10⁹/L to 10³/µL
        const convertedValue = numericValue.toString();
        return { value: convertedValue, unit: '10³/µL' };
      }
      return { value: numericValue.toString(), unit: '10³/µL' };
      
    case 'rbc':
      // Target: 10⁶/µL (millions per microliter)
      if (/10\^6|m\/|×10\^6|10⁶/i.test(rawUnit)) {
        // Already in 10⁶/µL format
        return { value: numericValue.toString(), unit: '10⁶/µL' };
      } else if (/mill\/cumm|mill\/mm3|mill\/mm³/i.test(rawUnit)) {
        // Already in millions per mm³ (same as 10⁶/µL)
        return { value: numericValue.toString(), unit: '10⁶/µL' };
      } else if (/10\^12|×10\^12/i.test(rawUnit)) {
        // Convert from 10¹²/L to 10⁶/µL
        const convertedValue = numericValue.toString();
        return { value: convertedValue, unit: '10⁶/µL' };
      }
      return { value: numericValue.toString(), unit: '10⁶/µL' };
      
    case 'hemoglobin':
    case 'mchc':
      // Target: g/dL
      if (/g\/dl|g%/i.test(rawUnit)) {
        return { value: numericValue.toString(), unit: 'g/dL' };
      } else if (/g\/l/i.test(rawUnit)) {
        // Convert from g/L to g/dL
        const convertedValue = (numericValue / 10).toFixed(1);
        return { value: convertedValue, unit: 'g/dL' };
      }
      return { value: numericValue.toString(), unit: 'g/dL' };
      
    case 'hematocrit':
    case 'rdw':
    case 'neutrophils':
    case 'lymphocytes':
    case 'monocytes':
    case 'eosinophils':
    case 'basophils':
      // Target: % (percentage)
      if (/%/.test(rawUnit)) {
        return { value: numericValue.toString(), unit: '%' };
      } else if (numericValue <= 1) {
        // Convert decimal to percentage
        const convertedValue = (numericValue * 100).toFixed(1);
        return { value: convertedValue, unit: '%' };
      }
      return { value: numericValue.toString(), unit: '%' };
      
    case 'mcv':
      // Target: fL
      if (/fl/i.test(rawUnit)) {
        return { value: numericValue.toString(), unit: 'fL' };
      }
      return { value: numericValue.toString(), unit: 'fL' };
      
    case 'mch':
      // Target: pg
      if (/pg/i.test(rawUnit)) {
        return { value: numericValue.toString(), unit: 'pg' };
      }
      return { value: numericValue.toString(), unit: 'pg' };
      
    default:
      return { value: numericValue.toString(), unit: rawUnit };
  }
};

// Process any image data (from PDF or direct image upload)
export const processImage = async (imageDataUrl: string): Promise<OCRResult> => {
  try {
    const worker = await createOCRWorker();
    console.log('Starting OCR processing on image...');
    const result = await worker.recognize(imageDataUrl);
    console.log('OCR processing complete, confidence:', result.data.confidence);
    await worker.terminate();
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process the image');
  }
};

// Convert a PDF page to an image using PDF.js
const convertPdfPageToImage = async (pdfData: ArrayBuffer): Promise<string> => {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Create a canvas to render the page
    const viewport = page.getViewport({ scale: 3.0 }); // Higher scale for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not create canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page on the canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Convert the canvas to an image data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error('Failed to convert PDF to image for OCR processing');
  }
};

// Process the uploaded PDF file and extract text via OCR
export const processPDF = async (file: File): Promise<OCRResult> => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    // Convert the PDF's first page to an image
    const imageDataUrl = await convertPdfPageToImage(arrayBuffer);
    
    // Process the image with OCR
    return await processImage(imageDataUrl);
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process the PDF file. Please ensure it\'s a valid PDF with readable text.');
  }
};

// Process an uploaded image file and extract text via OCR
export const processImageFile = async (file: File): Promise<OCRResult> => {
  try {
    // Read the file as data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // Process the image with OCR
    return await processImage(dataUrl);
  } catch (error) {
    console.error('Error processing image file:', error);
    throw new Error('Failed to process the image file');
  }
};

// Enhanced parameter extraction with world standard conversion
export const extractCBCData = (ocrText: string): ExtractedCBCData => {
  console.log('Extracted raw text:', ocrText);
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('Processed lines:', lines);
  
  const extractedData: ExtractedCBCData = {
    parameters: []
  };
  
  // Extract patient information
  const nameMatch = ocrText.match(/name\s*:?\s*([^\n]+)/i) || 
                   ocrText.match(/patient\s*:?\s*([^\n]+)/i) ||
                   ocrText.match(/patient\s*name\s*:?\s*([^\n]+)/i);
  if (nameMatch) {
    extractedData.patientName = nameMatch[1].trim();
  }
  
  const ageMatch = ocrText.match(/age\s*:?\s*(\d+)/i) || 
                  ocrText.match(/(\d+)\s*years?/i) ||
                  ocrText.match(/(\d+)\s*yrs?/i);
  if (ageMatch) {
    extractedData.patientAge = parseInt(ageMatch[1]);
  }
  
  const genderMatch = ocrText.match(/gender\s*:?\s*(\w+)/i) || 
                     ocrText.match(/sex\s*:?\s*(\w+)/i) ||
                     ocrText.match(/(?:^|\s)(male|female)(?:\s|$)/i);
  if (genderMatch) {
    const gender = genderMatch[1].toLowerCase();
    if (gender.includes('male') && !gender.includes('female')) {
      extractedData.patientGender = 'male';
    } else if (gender.includes('female')) {
      extractedData.patientGender = 'female';
    }
  }
  
  // Enhanced parameter mapping with multiple pattern variations
  const parameterMapping = [
    { 
      id: 'wbc', 
      patterns: [
        /\b(?:wbc|white\s*blood\s*cells?|leukocytes?|w\.b\.c|total\s*wbc\s*count|leucocyte\s*count)\b/i
      ]
    },
    { 
      id: 'rbc', 
      patterns: [
        /\b(?:rbc|red\s*blood\s*cells?|erythrocytes?|r\.b\.c|total\s*rbc\s*count|erythrocyte\s*count)\b/i
      ]
    },
    { 
      id: 'hemoglobin', 
      patterns: [
        /\b(?:h[ae]moglobin|hgb|hb)\b/i
      ]
    },
    { 
      id: 'hematocrit', 
      patterns: [
        /\b(?:h[ae]matocrit|hct|pcv|packed\s*cell\s*volume)\b/i
      ]
    },
    { 
      id: 'mcv', 
      patterns: [
        /\b(?:mcv|mean\s*corpuscular\s*volume|mean\s*cell\s*volume)\b/i
      ]
    },
    { 
      id: 'mch', 
      patterns: [
        /\b(?:mch|mean\s*corpuscular\s*h[ae]moglobin|mean\s*cell\s*h[ae]moglobin)\b/i
      ]
    },
    { 
      id: 'mchc', 
      patterns: [
        /\b(?:mchc|mean\s*corpuscular\s*h[ae]moglobin\s*concentration)\b/i
      ]
    },
    { 
      id: 'platelets', 
      patterns: [
        /\b(?:platelets|plt|thrombocytes|platelet\s*count)\b/i
      ]
    },
    { 
      id: 'neutrophils', 
      patterns: [
        /\b(?:neutrophils|neut|neutro|polymorphs?)\b/i
      ]
    },
    { 
      id: 'lymphocytes', 
      patterns: [
        /\b(?:lymphocytes|lymph|lymphs)\b/i
      ]
    },
    { 
      id: 'monocytes', 
      patterns: [
        /\b(?:monocytes|mono|monos)\b/i
      ]
    },
    { 
      id: 'eosinophils', 
      patterns: [
        /\b(?:eosinophils|eos|eosino)\b/i
      ]
    },
    { 
      id: 'basophils', 
      patterns: [
        /\b(?:basophils|baso|basos)\b/i
      ]
    },
    {
      id: 'rdw',
      patterns: [
        /\b(?:rdw|red\s*cell\s*distribution\s*width|red\s*distribution\s*width)\b/i
      ]
    }
  ];
  
  // Extract parameters with enhanced pattern matching
  for (const { id, patterns } of parameterMapping) {
    let parameterLine = '';
    let parameterLineIndex = -1;
    
    // Find the line containing the parameter name
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          parameterLine = line;
          parameterLineIndex = i;
          break;
        }
      }
      if (parameterLine) break;
    }
    
    if (parameterLine) {
      console.log(`Found parameter ${id} at line: ${parameterLine}`);
      
      // Look for the value in current line and next few lines
      const linesToCheck = [
        parameterLine,
        ...(parameterLineIndex + 1 < lines.length ? [lines[parameterLineIndex + 1]] : []),
        ...(parameterLineIndex + 2 < lines.length ? [lines[parameterLineIndex + 2]] : [])
      ];
      
      let found = false;
      for (const line of linesToCheck) {
        // Enhanced regex to capture various number and unit formats
        const matches = line.match(/(\d+\.?\d*)\s*([a-zA-Z%\/\^×]+[a-zA-Z%\/\^×µuL]*)/g);
        
        if (matches) {
          for (const match of matches) {
            const numberUnitMatch = match.match(/(\d+\.?\d*)\s*([a-zA-Z%\/\^×]+[a-zA-Z%\/\^×µuL]*)/);
            if (numberUnitMatch) {
              const rawValue = numberUnitMatch[1];
              const rawUnit = numberUnitMatch[2];
              
              console.log(`Raw extraction for ${id}: value=${rawValue}, unit=${rawUnit}`);
              
              // Convert to world standard
              const normalized = normalizeToWorldStandard(rawValue, rawUnit, id);
              
              console.log(`Normalized ${id}: value=${normalized.value}, unit=${normalized.unit}`);
              
              // Look for reference range nearby
              const rangeMatch = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) || 
                               (linesToCheck[1] ? linesToCheck[1].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null);
              
              let referenceRange = undefined;
              if (rangeMatch) {
                referenceRange = {
                  min: parseFloat(rangeMatch[1]),
                  max: parseFloat(rangeMatch[2])
                };
              }
              
              extractedData.parameters.push({
                id,
                value: normalized.value,
                unit: normalized.unit,
                referenceRange
              });
              
              found = true;
              break;
            }
          }
        }
        
        if (found) break;
        
        // Fallback: try to find just numbers if no unit detected
        const numberMatches = line.match(/\b(\d+\.?\d*)\b/g);
        if (numberMatches && numberMatches.length > 0 && !found) {
          const value = numberMatches[0];
          const standardUnit = WORLD_STANDARD_UNITS[id as keyof typeof WORLD_STANDARD_UNITS] || '';
          
          console.log(`Fallback extraction for ${id}: value=${value}, unit=${standardUnit}`);
          
          extractedData.parameters.push({
            id,
            value,
            unit: standardUnit,
            referenceRange: undefined
          });
          
          found = true;
          break;
        }
      }
    }
  }
  
  console.log('Final extracted data:', extractedData);
  return extractedData;
};

// Convert the extracted data to the CBCFormData format
export const convertToCBCFormData = (
  extractedData: ExtractedCBCData, 
  existingParameters: CBCParameter[]
): CBCFormData => {
  const formData: CBCFormData = {
    patientName: extractedData.patientName || '',
    patientAge: extractedData.patientAge || 0,
    patientGender: extractedData.patientGender || '',
    parameters: JSON.parse(JSON.stringify(existingParameters))
  };
  
  // Update parameters with extracted values (already normalized to world standards)
  extractedData.parameters.forEach(extractedParam => {
    const paramIndex = formData.parameters.findIndex(p => p.id === extractedParam.id);
    if (paramIndex !== -1) {
      formData.parameters[paramIndex] = {
        ...formData.parameters[paramIndex],
        value: extractedParam.value,
        unit: extractedParam.unit,
        referenceRange: extractedParam.referenceRange || formData.parameters[paramIndex].referenceRange
      };
    }
  });
  
  return formData;
};
