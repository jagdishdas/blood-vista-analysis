
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
  console.log('Raw OCR text preview:', rawText.substring(0, 500));
  
  // Common OCR corrections for medical reports
  let enhanced = rawText
    // Fix common OCR mistakes
    .replace(/\b0(?=\d)/g, 'O') // Leading zeros might be O
    .replace(/[|!]/g, 'I') // Vertical lines to I
    .replace(/[{}]/g, '') // Remove braces
    .replace(/[@#$]/g, '') // Remove special chars
    // Fix common medical term OCR errors
    .replace(/h[ae]?mog[l|!]obin/gi, 'hemoglobin')
    .replace(/h[ae]?matocr[i|!]t/gi, 'hematocrit')
    .replace(/p[l|!]ate[l|!]ets?/gi, 'platelets')
    .replace(/neutrophi[l|!]s?/gi, 'neutrophils')
    .replace(/[l|!]ymphocytes?/gi, 'lymphocytes')
    .replace(/monocytes?/gi, 'monocytes')
    .replace(/eos[i|!]nophi[l|!]s?/gi, 'eosinophils')
    .replace(/basophi[l|!]s?/gi, 'basophils')
    // Fix unit OCR errors
    .replace(/g\/d[l|!]/gi, 'g/dL')
    .replace(/f[l|!]/gi, 'fL')
    .replace(/pg/gi, 'pg')
    .replace(/cumm|mm[3³]|\/mm³/gi, '/µL')
    .replace(/×10[³3]|x10[³3]|10[³3]/gi, '10³')
    .replace(/×10[⁶6]|x10[⁶6]|10[⁶6]/gi, '10⁶');
  
  console.log('Enhanced OCR text preview:', enhanced.substring(0, 500));
  return enhanced;
};

// Smart pattern matching for medical values with more flexible patterns
export const extractMedicalValues = (text: string): Array<{parameter: string, value: string, unit: string}> => {
  const results: Array<{parameter: string, value: string, unit: string}> = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  console.log('Processing lines for medical values:', lines.length, 'lines');
  
  // Enhanced patterns for medical parameters with more flexible matching
  const patterns = [
    {
      parameter: 'wbc',
      patterns: [
        /(?:wbc|white.*blood.*cell|leukocyte|total.*wbc)[\s:]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|\/µl|\/ul|cumm|mm³)?/gi,
        /(?:total.*count|tc)[\s:]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|\/µl|\/ul|cumm|mm³)?/gi,
        /wbc[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'rbc',
      patterns: [
        /(?:rbc|red.*blood.*cell|erythrocyte)[\s:]*(\d+\.?\d*)\s*(?:×10⁶|x10⁶|10⁶|m|mill|\/µl|\/ul|cumm|mm³)?/gi,
        /rbc[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'hemoglobin',
      patterns: [
        /(?:h[ae]?moglobin|hgb|hb)[\s:]*(\d+\.?\d*)\s*(?:g\/dl|g%|g\/l)?/gi,
        /hb[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'hematocrit',
      patterns: [
        /(?:h[ae]?matocrit|hct|pcv)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /hct[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'platelets',
      patterns: [
        /(?:platelet|plt|thrombocyte)[\s:]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|\/µl|\/ul|cumm|mm³)?/gi,
        /plt[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mcv',
      patterns: [
        /(?:mcv|mean.*corpuscular.*volume)[\s:]*(\d+\.?\d*)\s*fl?/gi,
        /mcv[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mch',
      patterns: [
        /(?:mch|mean.*corpuscular.*h[ae]?moglobin)(?!.*concentration)[\s:]*(\d+\.?\d*)\s*pg?/gi,
        /(?:^|\s)mch(?!\w)[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mchc',
      patterns: [
        /(?:mchc|mean.*corpuscular.*h[ae]?moglobin.*concentration)[\s:]*(\d+\.?\d*)\s*(?:g\/dl|g%)?/gi,
        /mchc[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'rdw',
      patterns: [
        /(?:rdw|red.*distribution.*width)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /rdw[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'neutrophils',
      patterns: [
        /(?:neutrophil|neut|polymorphs?)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /neut[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'lymphocytes',
      patterns: [
        /(?:lymphocyte|lymph)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /lymph[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'monocytes',
      patterns: [
        /(?:monocyte|mono)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /mono[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'eosinophils',
      patterns: [
        /(?:eosinophil|eos)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /eos[\s:]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'basophils',
      patterns: [
        /(?:basophil|baso)[\s:]*(\d+\.?\d*)\s*%?/gi,
        /baso[\s:]*(\d+\.?\d*)/gi
      ]
    }
  ];
  
  // Process each line and pattern
  for (const {parameter, patterns: paramPatterns} of patterns) {
    let found = false;
    
    // Check each line for matches
    for (const line of lines) {
      if (found) break;
      
      for (const pattern of paramPatterns) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          const value = match[1];
          
          // Skip if value is clearly invalid
          if (!value || isNaN(parseFloat(value))) continue;
          
          // Determine unit based on parameter and context
          let unit = '';
          const lineText = line.toLowerCase();
          
          if (parameter === 'wbc' || parameter === 'platelets') {
            if (lineText.includes('×10³') || lineText.includes('x10³') || lineText.includes('10³')) {
              unit = '10³/µL';
            } else if (lineText.includes('/µl') || lineText.includes('/ul') || lineText.includes('cumm')) {
              unit = '/µL';
            } else {
              unit = '10³/µL'; // Default for WBC and platelets
            }
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
          } else if (parameter === 'rdw') {
            unit = '%';
          }
          
          console.log(`Found ${parameter}: ${value} ${unit} in line: "${line}"`);
          results.push({ parameter, value, unit });
          found = true;
          break;
        }
      }
    }
  }
  
  console.log('Total extracted medical values:', results.length);
  return results;
};
