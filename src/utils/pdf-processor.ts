
import { createWorker } from 'tesseract.js';
import { OCRResult, ExtractedCBCData, CBCParameter, CBCFormData } from '@/types/cbc.types';
import { pdfjs } from 'react-pdf';

// Initialize PDF.js with a direct path to the worker with specific version to avoid runtime errors
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Create a Tesseract worker for OCR processing
const createOCRWorker = async () => {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-+:%/ ',
  });
  return worker;
};

// Process any image data (from PDF or direct image upload)
export const processImage = async (imageDataUrl: string): Promise<OCRResult> => {
  try {
    // Use Tesseract.js to perform OCR on the image
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
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
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
    throw new Error('Failed to convert PDF to image');
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
    throw new Error('Failed to process the PDF file');
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

// Normalize different unit formats to a standardized form
const normalizeUnit = (unit: string): string => {
  // Handle various unit formats
  if (/10\^3\/[µu]l|k\/[µu]l|×10\^3\/[µu]l|10³\/[µu]l/i.test(unit)) {
    return '10³/µL'; // Standardize to 10³/µL
  }
  if (/10\^6\/[µu]l|m\/[µu]l|×10\^6\/[µu]l|10⁶\/[µu]l/i.test(unit)) {
    return '10⁶/µL'; // Standardize to 10⁶/µL
  }
  if (/g\/dl|g%/i.test(unit)) {
    return 'g/dL'; // Standardize to g/dL
  }
  if (/fl/i.test(unit)) {
    return 'fL'; // Standardize to fL
  }
  if (/pg/i.test(unit)) {
    return 'pg'; // Standardize to pg
  }
  if (unit === '%') {
    return '%';
  }
  if (/cumm|\/mm3|\/mm³/i.test(unit)) {
    return '/mm³'; // Standardize units like /mm3 or cumm
  }
  if (/mill\/cumm|mill\/mm3|mill\/mm³/i.test(unit)) {
    return 'mill/mm³'; // For red blood cell count
  }

  return unit; // Return as is if no match
};

// Convert value to standard format
const normalizeValue = (value: string, unit: string): string => {
  const numericValue = parseFloat(value);
  
  // Handle various scientific notations and ensure proper scaling
  if (/10\^3|k\/|×10\^3|10³/i.test(unit)) {
    // Already in thousands, return as is
    return numericValue.toString();
  }
  if (/10\^6|m\/|×10\^6|10⁶/i.test(unit)) {
    // Already in millions, return as is
    return numericValue.toString();
  }
  
  // Handle raw counts that might be in different formats
  if (/cumm|\/mm3|\/mm³/i.test(unit) && numericValue > 1000) {
    // If WBC count is given as absolute (e.g. 9000 instead of 9.0)
    if (numericValue > 1000 && numericValue < 30000) {
      return numericValue.toString(); // Keep as absolute count
    }
  }
  
  return numericValue.toString();
};

// Parse the OCR text to extract CBC parameters - enhanced to handle different formats
export const extractCBCData = (ocrText: string): ExtractedCBCData => {
  console.log('Extracted raw text:', ocrText);
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('Processed lines:', lines);
  
  // Initialize the extracted data
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
  
  // Extract age - look for patterns like "Age: 45" or "45 years"
  const ageMatch = ocrText.match(/age\s*:?\s*(\d+)/i) || 
                  ocrText.match(/(\d+)\s*years?/i) ||
                  ocrText.match(/(\d+)\s*yrs?/i);
  if (ageMatch) {
    extractedData.patientAge = parseInt(ageMatch[1]);
  }
  
  // Extract gender - more flexible matching
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
  
  // Define the parameters to extract with their possible names in reports
  const parameterMapping = [
    { 
      id: 'wbc', 
      patterns: [/\b(?:wbc|white\s*blood\s*cells?|leukocytes?|w\.b\.c|total\s*wbc\s*count)\b/i], 
      valuePatterns: [
        /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l|10\^3\/[µu]l|×\s*10\^3\/[µu]l)/i,
        /\b\d+\.?\d*\s*(?:cumm|\/mm3|\/mm³)/i
      ]
    },
    { 
      id: 'rbc', 
      patterns: [/\b(?:rbc|red\s*blood\s*cells?|erythrocytes?|r\.b\.c|total\s*rbc\s*count)\b/i], 
      valuePatterns: [
        /\b\d+\.?\d*\s*(?:x\s*10\^6\/[µu]l|m\/[µu]l|10\^6\/[µu]l|×\s*10\^6\/[µu]l)/i,
        /\b\d+\.?\d*\s*(?:mill\/cumm|mill\/mm3|mill\/mm³)/i
      ]
    },
    { 
      id: 'hemoglobin', 
      patterns: [/\b(?:h[ae]moglobin|hgb|hb)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*(?:g\/dl|g%)/i] 
    },
    { 
      id: 'hematocrit', 
      patterns: [/\b(?:h[ae]matocrit|hct|pcv|packed\s*cell\s*volume)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i] 
    },
    { 
      id: 'mcv', 
      patterns: [/\b(?:mcv|mean\s*corpuscular\s*volume)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*(?:fl|fL)/i] 
    },
    { 
      id: 'mch', 
      patterns: [/\b(?:mch|mean\s*corpuscular\s*h[ae]moglobin)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*(?:pg)/i] 
    },
    { 
      id: 'mchc', 
      patterns: [/\b(?:mchc|mean\s*corpuscular\s*h[ae]moglobin\s*concentration)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*(?:g\/dl|%)/i] 
    },
    { 
      id: 'platelets', 
      patterns: [/\b(?:platelets|plt|thrombocytes|platelet\s*count)\b/i], 
      valuePatterns: [
        /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l|10\^3\/[µu]l|×\s*10\^3\/[µu]l)/i,
        /\b\d+\.?\d*\s*(?:cumm|\/mm3|\/mm³)/i,
        /\b\d+\.?\d*\s*(?:10\^3)/i
      ]
    },
    { 
      id: 'neutrophils', 
      patterns: [/\b(?:neutrophils|neut|neutro)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i, /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l)/i] 
    },
    { 
      id: 'lymphocytes', 
      patterns: [/\b(?:lymphocytes|lymph)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i, /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l)/i] 
    },
    { 
      id: 'monocytes', 
      patterns: [/\b(?:monocytes|mono)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i, /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l)/i] 
    },
    { 
      id: 'eosinophils', 
      patterns: [/\b(?:eosinophils|eos)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i, /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l)/i] 
    },
    { 
      id: 'basophils', 
      patterns: [/\b(?:basophils|baso)\b/i], 
      valuePatterns: [/\b\d+\.?\d*\s*%/i, /\b\d+\.?\d*\s*(?:x\s*10\^3\/[µu]l|k\/[µu]l)/i] 
    },
    {
      id: 'rdw',
      patterns: [/\b(?:rdw|red\s*cell\s*distribution\s*width)\b/i],
      valuePatterns: [/\b\d+\.?\d*\s*%/i]
    }
  ];
  
  // Extract parameters from the OCR text with improved pattern matching
  for (const { id, patterns, valuePatterns } of parameterMapping) {
    // First find a line that contains the parameter name
    let parameterLine = '';
    let parameterLineIndex = -1;
    
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
      
      // Look for the value in the current line and next few lines
      const linesToCheck = [
        parameterLine,
        ...(parameterLineIndex + 1 < lines.length ? [lines[parameterLineIndex + 1]] : []),
        ...(parameterLineIndex + 2 < lines.length ? [lines[parameterLineIndex + 2]] : [])
      ];
      
      // Try to find value using specific patterns for this parameter
      let found = false;
      for (const line of linesToCheck) {
        for (const valPattern of valuePatterns) {
          const valueMatch = line.match(valPattern);
          if (valueMatch) {
            // Extract just the numeric part
            const numericMatch = valueMatch[0].match(/\d+\.?\d*/);
            if (numericMatch) {
              const rawValue = numericMatch[0];
              
              // Try to extract unit
              const unitMatch = valueMatch[0].match(/[a-zA-Z%\/]+\/[a-zA-Z]+|[gµfp][\/]?[dLml]|10\^\d+\/[µu][lL]|[×x]\s*10\^[36]\/[µu][lL]|[kKmM]\/[µu][lL]|%|cumm|\/mm3|\/mm³|mill\/cumm|mill\/mm3|mill\/mm³/);
              const rawUnit = unitMatch ? unitMatch[0] : '';
              
              // Normalize value and unit
              const unit = normalizeUnit(rawUnit);
              const value = normalizeValue(rawValue, rawUnit);
              
              // Look for reference range nearby
              const rangeMatch = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) || 
                               (linesToCheck[1] ? linesToCheck[1].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null) ||
                               (linesToCheck[2] ? linesToCheck[2].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null);
              
              let referenceRange = undefined;
              if (rangeMatch) {
                referenceRange = {
                  min: parseFloat(rangeMatch[1]),
                  max: parseFloat(rangeMatch[2])
                };
              }
              
              extractedData.parameters.push({
                id,
                value,
                unit,
                referenceRange
              });
              
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      
      // If parameter-specific patterns didn't work, try generic number extraction
      if (!found) {
        for (const line of linesToCheck) {
          // Look for numbers in the line - more robust extraction
          const valueMatches = line.match(/\b(\d+\.?\d*)\b/g);
          if (valueMatches && valueMatches.length > 0) {
            // Use the first number found if multiple are present
            const value = valueMatches[0];
            
            // Try to detect unit based on common patterns in lab reports
            const unitMatches = line.match(/[a-zA-Z%\/]+\/[a-zA-Z]+|[gµfp][\/]?[dLml]|10\^\d+\/[µu][lL]|[×x]\s*10\^[36]\/[µu][lL]|[kKmM]\/[µu][lL]|%|cumm|\/mm3|\/mm³|mill\/cumm|mill\/mm3|mill\/mm³/);
            const rawUnit = unitMatches ? unitMatches[0] : '';
            const unit = normalizeUnit(rawUnit);
            
            // Try to extract reference range from this line or nearby lines
            const rangeMatch = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) || 
                             (linesToCheck[1] ? linesToCheck[1].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null) ||
                             (linesToCheck[2] ? linesToCheck[2].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null);
            
            let referenceRange = undefined;
            if (rangeMatch) {
              referenceRange = {
                min: parseFloat(rangeMatch[1]),
                max: parseFloat(rangeMatch[2])
              };
            }
            
            extractedData.parameters.push({
              id,
              value,
              unit,
              referenceRange
            });
            
            found = true;
            break;
          }
        }
      }
    }
  }
  
  console.log('Extracted data:', extractedData);
  return extractedData;
};

// Convert the extracted data to the CBCFormData format
export const convertToCBCFormData = (
  extractedData: ExtractedCBCData, 
  existingParameters: CBCParameter[]
): CBCFormData => {
  // Start with default values
  const formData: CBCFormData = {
    patientName: extractedData.patientName || '',
    patientAge: extractedData.patientAge || 0,
    patientGender: extractedData.patientGender || '',
    parameters: JSON.parse(JSON.stringify(existingParameters)) // Deep clone the existing parameters
  };
  
  // Update parameters with extracted values
  extractedData.parameters.forEach(extractedParam => {
    const paramIndex = formData.parameters.findIndex(p => p.id === extractedParam.id);
    if (paramIndex !== -1) {
      formData.parameters[paramIndex] = {
        ...formData.parameters[paramIndex],
        value: extractedParam.value,
        // If we have extracted reference range, update it
        referenceRange: extractedParam.referenceRange || formData.parameters[paramIndex].referenceRange
      };
    }
  });
  
  return formData;
};
