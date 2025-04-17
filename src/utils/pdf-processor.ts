
import { createWorker } from 'tesseract.js';
import { OCRResult, ExtractedCBCData, CBCParameter, CBCFormData } from '@/types/cbc.types';

// Create a Tesseract worker for OCR processing
const createOCRWorker = async () => {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-+:%/ ',
  });
  return worker;
};

// Process the uploaded PDF file and convert it to an image
export const processPDF = async (file: File): Promise<OCRResult> => {
  try {
    // For demo purposes, we'll use the FileReader API to read the PDF as a data URL
    // In a production app, we would use PDF.js to render each page as an image for OCR
    
    // Convert the PDF to an image using a canvas
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    
    // Create a temporary image element
    const img = new Image();
    img.src = dataUrl;
    
    // Use Tesseract.js to perform OCR on the image
    const worker = await createOCRWorker();
    const result = await worker.recognize(dataUrl);
    await worker.terminate();
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process the PDF file');
  }
};

// Parse the OCR text to extract CBC parameters
export const extractCBCData = (ocrText: string): ExtractedCBCData => {
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Initialize the extracted data
  const extractedData: ExtractedCBCData = {
    parameters: []
  };
  
  // Extract patient information
  const nameMatch = ocrText.match(/name\s*:\s*([^\n]+)/i) || ocrText.match(/patient\s*:\s*([^\n]+)/i);
  if (nameMatch) {
    extractedData.patientName = nameMatch[1].trim();
  }
  
  // Extract age
  const ageMatch = ocrText.match(/age\s*:\s*(\d+)/i);
  if (ageMatch) {
    extractedData.patientAge = parseInt(ageMatch[1]);
  }
  
  // Extract gender
  const genderMatch = ocrText.match(/gender\s*:\s*(\w+)/i) || ocrText.match(/sex\s*:\s*(\w+)/i);
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
    { id: 'wbc', patterns: [/wbc/i, /white\s*blood\s*cell/i, /leucocyte/i] },
    { id: 'rbc', patterns: [/rbc/i, /red\s*blood\s*cell/i, /erythrocyte/i] },
    { id: 'hemoglobin', patterns: [/h[ae]moglobin/i, /hgb/i, /hb/i] },
    { id: 'hematocrit', patterns: [/h[ae]matocrit/i, /hct/i, /pcv/i] },
    { id: 'mcv', patterns: [/mcv/i, /mean\s*corpuscular\s*volume/i] },
    { id: 'mch', patterns: [/mch\s/i] },
    { id: 'mchc', patterns: [/mchc/i] },
    { id: 'platelets', patterns: [/platelets/i, /plt/i, /thrombocytes/i] },
    { id: 'neutrophils', patterns: [/neutrophils/i, /neut/i] },
    { id: 'lymphocytes', patterns: [/lymphocytes/i, /lymph/i] },
    { id: 'monocytes', patterns: [/monocytes/i, /mono/i] },
    { id: 'eosinophils', patterns: [/eosinophils/i, /eos/i] },
    { id: 'basophils', patterns: [/basophils/i, /baso/i] }
  ];
  
  // Extract parameters from the OCR text
  for (const { id, patterns } of parameterMapping) {
    for (const pattern of patterns) {
      // Search for the parameter in the text
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (pattern.test(line)) {
          // Try to extract the value, unit, and reference range from this line or the next few lines
          const valueMatch = line.match(/\d+\.?\d*/);
          if (valueMatch) {
            const value = valueMatch[0];
            
            // Try to extract reference range
            const referenceRangeMatch = 
              line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) || 
              (i+1 < lines.length ? lines[i+1].match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/) : null);
            
            let referenceRange = undefined;
            if (referenceRangeMatch) {
              referenceRange = {
                min: parseFloat(referenceRangeMatch[1]),
                max: parseFloat(referenceRangeMatch[2])
              };
            }
            
            // Try to extract unit
            const unitMatch = line.match(/[a-zA-Z%\/]+\/[a-zA-Z]+|[gµfp][\/]?[dLml]|10\^\d+\/[µL]|[%]/);
            const unit = unitMatch ? unitMatch[0] : '';
            
            extractedData.parameters.push({
              id,
              value,
              unit,
              referenceRange
            });
            
            break;
          }
        }
      }
    }
  }
  
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
