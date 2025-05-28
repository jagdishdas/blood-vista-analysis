
// OCR Enhancement utilities for better text recognition and data extraction

export const preprocessImageForOCR = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale using luminance formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    // Enhance contrast - make dark text darker and light background lighter
    const enhanced = gray < 128 ? Math.max(0, gray - 50) : Math.min(255, gray + 50);
    
    data[i] = enhanced;     // Red
    data[i + 1] = enhanced; // Green
    data[i + 2] = enhanced; // Blue
    // Alpha channel stays the same
  }
  
  // Put processed image back
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export const enhanceOCRText = (rawText: string): string => {
  console.log('Raw OCR text:', rawText);
  
  // Common OCR corrections for medical reports
  let enhanced = rawText
    // Fix common OCR mistakes
    .replace(/\b0(?=\d)/g, 'O') // Leading zeros might be O
    .replace(/[|!]/g, 'I') // Vertical lines to I
    .replace(/[{}]/g, '') // Remove braces
    .replace(/[@#$]/g, '') // Remove special chars
    // Fix common medical term OCR errors
    .replace(/hemog|obin/gi, 'hemoglobin')
    .replace(/hematocr|t/gi, 'hematocrit')
    .replace(/p|ate|ets/gi, 'platelets')
    .replace(/neutrophi|s/gi, 'neutrophils')
    .replace(/|ymphocytes/gi, 'lymphocytes')
    .replace(/monocytes/gi, 'monocytes')
    .replace(/eos|nophi|s/gi, 'eosinophils')
    .replace(/basophi|s/gi, 'basophils')
    // Fix unit OCR errors
    .replace(/\bg\/d|\b/gi, 'g/dL')
    .replace(/\bf|\b/gi, 'fL')
    .replace(/\bpg\b/gi, 'pg')
    .replace(/cumm|mm3|mm³/gi, '/µL')
    .replace(/×10\^3|x10\^3|10\^3/gi, '10³')
    .replace(/×10\^6|x10\^6|10\^6/gi, '10⁶');
  
  console.log('Enhanced OCR text:', enhanced);
  return enhanced;
};

// Smart pattern matching for medical values
export const extractMedicalValues = (text: string): Array<{parameter: string, value: string, unit: string}> => {
  const results: Array<{parameter: string, value: string, unit: string}> = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Enhanced patterns for medical parameters
  const patterns = [
    {
      parameter: 'wbc',
      patterns: [
        /(?:wbc|white.*blood.*cell|leukocyte|total.*wbc).*?(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou)?\s*(?:\/µl|\/ul|cumm|mm³)?/gi,
        /(?:wbc|white.*blood.*cell).*?(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'rbc',
      patterns: [
        /(?:rbc|red.*blood.*cell|erythrocyte).*?(\d+\.?\d*)\s*(?:×10⁶|x10⁶|10⁶|m|mill)?\s*(?:\/µl|\/ul|cumm|mm³)?/gi,
        /(?:rbc|red.*blood.*cell).*?(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'hemoglobin',
      patterns: [
        /(?:h[ae]moglobin|hgb|hb).*?(\d+\.?\d*)\s*(?:g\/dl|g%|g\/l)?/gi
      ]
    },
    {
      parameter: 'hematocrit',
      patterns: [
        /(?:h[ae]matocrit|hct|pcv).*?(\d+\.?\d*)\s*%?/gi
      ]
    },
    {
      parameter: 'platelets',
      patterns: [
        /(?:platelet|plt|thrombocyte).*?(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou)?\s*(?:\/µl|\/ul|cumm|mm³)?/gi,
        /(?:platelet|plt).*?(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mcv',
      patterns: [
        /(?:mcv|mean.*corpuscular.*volume).*?(\d+\.?\d*)\s*fl?/gi
      ]
    },
    {
      parameter: 'mch',
      patterns: [
        /(?:mch|mean.*corpuscular.*h[ae]moglobin).*?(\d+\.?\d*)\s*pg?/gi
      ]
    },
    {
      parameter: 'mchc',
      patterns: [
        /(?:mchc|mean.*corpuscular.*h[ae]moglobin.*concentration).*?(\d+\.?\d*)\s*(?:g\/dl|g%)?/gi
      ]
    },
    {
      parameter: 'neutrophils',
      patterns: [
        /(?:neutrophil|neut|polymorphs?).*?(\d+\.?\d*)\s*%?/gi
      ]
    },
    {
      parameter: 'lymphocytes',
      patterns: [
        /(?:lymphocyte|lymph).*?(\d+\.?\d*)\s*%?/gi
      ]
    }
  ];
  
  for (const {parameter, patterns: paramPatterns} of patterns) {
    for (const line of lines) {
      for (const pattern of paramPatterns) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          const value = match[1];
          
          // Determine unit based on parameter and context
          let unit = '';
          if (parameter === 'wbc' || parameter === 'platelets') {
            unit = '10³/µL';
          } else if (parameter === 'rbc') {
            unit = '10⁶/µL';
          } else if (parameter === 'hemoglobin' || parameter === 'mchc') {
            unit = 'g/dL';
          } else if (parameter === 'hematocrit' || parameter.includes('phil') || parameter.includes('cyte')) {
            unit = '%';
          } else if (parameter === 'mcv') {
            unit = 'fL';
          } else if (parameter === 'mch') {
            unit = 'pg';
          }
          
          results.push({ parameter, value, unit });
          break;
        }
      }
    }
  }
  
  console.log('Extracted medical values:', results);
  return results;
};
