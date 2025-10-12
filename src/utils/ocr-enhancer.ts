
// OCR Enhancement utilities for better text recognition and data extraction

// Advanced preprocessing pipeline for optimal OCR accuracy
export const preprocessImageForOCR = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Step 1: Upscale for better resolution (2x)
  const scaleFactor = 2;
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scaleFactor;
  scaledCanvas.height = canvas.height * scaleFactor;
  const scaledCtx = scaledCanvas.getContext('2d');
  if (!scaledCtx) return canvas;
  
  // Use high-quality image smoothing
  scaledCtx.imageSmoothingEnabled = true;
  scaledCtx.imageSmoothingQuality = 'high';
  scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
  
  // Get image data for processing
  const imageData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
  const data = imageData.data;
  
  // Step 2: Convert to grayscale
  const grayData = new Uint8ClampedArray(data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    grayData[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  
  // Step 3: Apply Gaussian blur for noise reduction
  const blurred = applyGaussianBlur(grayData, scaledCanvas.width, scaledCanvas.height);
  
  // Step 4: Adaptive thresholding (Otsu's method)
  const threshold = calculateOtsuThreshold(blurred);
  
  // Step 5: Apply threshold and enhance
  for (let i = 0; i < data.length; i += 4) {
    const gray = blurred[i / 4];
    // Binary threshold with slight smoothing
    const value = gray > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  
  // Step 6: Morphological operations to remove noise
  morphologicalClose(new Uint8Array(data.buffer), scaledCanvas.width, scaledCanvas.height, data);
  
  scaledCtx.putImageData(imageData, 0, 0);
  return scaledCanvas;
};

// Gaussian blur for noise reduction
const applyGaussianBlur = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1]; // 3x3 Gaussian kernel
  const kernelSum = 16;
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          sum += data[idx] * kernel[kernelIdx];
        }
      }
      result[y * width + x] = sum / kernelSum;
    }
  }
  return result;
};

// Otsu's method for automatic threshold calculation
const calculateOtsuThreshold = (data: Uint8ClampedArray): number => {
  const histogram = new Array(256).fill(0);
  data.forEach(val => histogram[val]++);
  
  const total = data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  
  return threshold;
};

// Morphological closing to fill small gaps
const morphologicalClose = (data: Uint8Array, width: number, height: number, imageData: Uint8ClampedArray): void => {
  const structElement = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ];
  
  // Simple dilation followed by erosion
  for (let pass = 0; pass < 1; pass++) {
    const temp = new Uint8ClampedArray(imageData.length);
    for (let i = 0; i < imageData.length; i += 4) {
      const y = Math.floor(i / 4 / width);
      const x = (i / 4) % width;
      let maxVal = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (structElement[ky + 1][kx + 1]) {
            const ny = y + ky;
            const nx = x + kx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const idx = (ny * width + nx) * 4;
              maxVal = Math.max(maxVal, imageData[idx]);
            }
          }
        }
      }
      temp[i] = temp[i + 1] = temp[i + 2] = maxVal;
      temp[i + 3] = imageData[i + 3];
    }
    imageData.set(temp);
  }
};

export const enhanceOCRText = (rawText: string): string => {
  console.log('Raw OCR text preview:', rawText.substring(0, 500));
  
  let enhanced = rawText
    // Normalize whitespace and line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    
    // Fix common OCR character confusions
    .replace(/\b0(?=[A-Za-z])/g, 'O') // 0 before letters
    .replace(/O(?=\d)/g, '0') // O before numbers
    .replace(/[|!¡]/g, 'I')
    .replace(/[{}[\]]/g, '')
    .replace(/[@#$%^&*]/g, '')
    .replace(/\b1(?=\s*[l|!])/gi, 'I') // 1 that should be I
    .replace(/\bs\b/gi, '5') // Isolated 's' might be 5
    .replace(/\bS\b(?=\d)/g, '5')
    
    // Advanced medical term corrections with context
    .replace(/\b[h|!][ae]?[m|n|u|r][o0][g|q][l|!][o0][b|h][l|!][n|u](?:\s*(?:count|level|test))?/gi, 'hemoglobin')
    .replace(/\b[h|!][ae]?[m|n|u][a|e|o][t|l][o0][c|k|x][r|t][i|!|l][t|l]/gi, 'hematocrit')
    .replace(/\bp[l|!|i][a|e|o][t|l][e|c][l|!|i][e|c][t|l]s?/gi, 'platelets')
    .replace(/\bw[h|!|b|8]?[i|!|l]?[t|l]?[e|c]?\s*[b|8|h][l|!|i]?[o0]?[o0]?d\s*c[e|c][l|!|i]{1,2}s?\b/gi, 'white blood cells')
    .replace(/\br[e|c][d|b]\s*[b|8|h][l|!|i]?[o0]?[o0]?d\s*c[e|c][l|!|i]{1,2}s?\b/gi, 'red blood cells')
    .replace(/\bn[e|c][u|v][t|l|i][r|t][o0][p|b|h][h|b|n][i|!|l|1][l|!|i|1]s?\b/gi, 'neutrophils')
    .replace(/\b[l|!|i|1][y|v][m|n|u][p|b|h][h|b|n]?[o0][c|k][y|v][t|l][e|c]s?\b/gi, 'lymphocytes')
    .replace(/\bm[o0]n[o0][c|k][y|v][t|l][e|c]s?\b/gi, 'monocytes')
    .replace(/\b[e|c][o0]s[i|!|l|1]n[o0][p|b|h][h|b|n][i|!|l|1][l|!|i|1]s?\b/gi, 'eosinophils')
    .replace(/\bb[a|e]s[o0][p|b|h][h|b|n][i|!|l|1][l|!|i|1]s?\b/gi, 'basophils')
    .replace(/\bm[c|k][v|u|w]/gi, 'MCV')
    .replace(/\bm[c|k][h|b|n]/gi, 'MCH')
    .replace(/\bm[c|k][h|b|n][c|k]/gi, 'MCHC')
    .replace(/\br[d|b][w|v|m]/gi, 'RDW')
    .replace(/\bw[b|8|h][c|k]/gi, 'WBC')
    .replace(/\br[b|8|h][c|k]/gi, 'RBC')
    .replace(/\bp[l|!|i][t|l]/gi, 'PLT')
    
    // Unit corrections with context awareness
    .replace(/\b(\d+\.?\d*)\s*[g|q|9]\s*[\/\\]\s*d[l|!|i|1]/gi, '$1 g/dL')
    .replace(/\b(\d+\.?\d*)\s*[f|t][l|!|i|1]/gi, '$1 fL')
    .replace(/\b(\d+\.?\d*)\s*p[g|q|9]/gi, '$1 pg')
    .replace(/\b(\d+\.?\d*)\s*(?:cumm|cu\.mm|mm[3³]|\/mm³)/gi, '$1 /µL')
    .replace(/(?:×|x|X)\s*10\s*[³3]/gi, '×10³')
    .replace(/(?:×|x|X)\s*10\s*[⁶6]/gi, '×10⁶')
    .replace(/\b10\s*\^\s*[3³]/gi, '×10³')
    .replace(/\b10\s*\^\s*[6⁶]/gi, '×10⁶')
    
    // Fix decimal points and numbers
    .replace(/(\d)\s+\.(\d)/g, '$1.$2')
    .replace(/(\d)\.(?!\d)/g, '$1')
    .replace(/(\d)\s+(\d)/g, '$1$2')
    
    // Common ratio/range separators
    .replace(/(\d\.?\d*)\s*[-–—~]\s*(\d\.?\d*)/g, '$1-$2');
  
  console.log('Enhanced OCR text preview:', enhanced.substring(0, 500));
  return enhanced;
};

// Smart pattern matching with context-aware extraction
export const extractMedicalValues = (text: string): Array<{parameter: string, value: string, unit: string}> => {
  const results: Array<{parameter: string, value: string, unit: string}> = [];
  
  // Process as both lines and full text for different extraction strategies
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const normalizedText = text.toLowerCase();
  
  console.log('Processing lines for medical values:', lines.length, 'lines');
  
  // Enhanced patterns with multiple variations and context
  const patterns = [
    {
      parameter: 'wbc',
      patterns: [
        /(?:wbc|w\.?b\.?c\.?|white\s*blood\s*cell(?:s|\scount)?|leukocyte(?:s|\scount)?|total\s*wbc|total\s*leukocyte)[\s:=\-—]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|thousand|\/µl|\/ul|cumm|mm³|per\s*µl)?/gi,
        /(?:total\s*count|tc|total\s*wbc\s*count)[\s:=\-—]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|\/µl|\/ul|cumm|mm³)?/gi,
        /\bwbc\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /white\s*blood[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'rbc',
      patterns: [
        /(?:rbc|r\.?b\.?c\.?|red\s*blood\s*cell(?:s|\scount)?|erythrocyte(?:s|\scount)?)[\s:=\-—]*(\d+\.?\d*)\s*(?:×10⁶|x10⁶|10⁶|m|mill|million|\/µl|\/ul|cumm|mm³|per\s*µl)?/gi,
        /\brbc\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /red\s*blood[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'hemoglobin',
      patterns: [
        /(?:h[ae]?moglobin|h[ae]?emoglobin|hgb|h\.?b\.?|hb\s*level|hb\s*count)[\s:=\-—]*(\d+\.?\d*)\s*(?:g\/dl|g\s*\/\s*dl|gm\/dl|g%|g\/l|gm\s*%)?/gi,
        /\bhb\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /hemoglobin[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'hematocrit',
      patterns: [
        /(?:h[ae]?matocrit|h[ae]?ematocrit|hct|h\.?c\.?t\.?|pcv|p\.?c\.?v\.?|packed\s*cell\s*volume)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\bhct\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /\bpcv\b[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'platelets',
      patterns: [
        /(?:platelet(?:s|\scount)?|plt|p\.?l\.?t\.?|thrombocyte(?:s|\scount)?)[\s:=\-—]*(\d+\.?\d*)\s*(?:×10³|x10³|10³|k|thou|lakh|lacs|\/µl|\/ul|cumm|mm³|per\s*µl)?/gi,
        /\bplt\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /platelet[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mcv',
      patterns: [
        /(?:mcv|m\.?c\.?v\.?|mean\s*corpuscular\s*volume|mean\s*cell\s*volume)[\s:=\-—]*(\d+\.?\d*)\s*(?:fl|f\.?l\.?|femtoliter)?/gi,
        /\bmcv\b[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mch',
      patterns: [
        /(?:mch|m\.?c\.?h\.?|mean\s*corpuscular\s*h[ae]?moglobin|mean\s*cell\s*h[ae]?moglobin)(?!\s*(?:conc|concentration))[\s:=\-—]*(\d+\.?\d*)\s*(?:pg|p\.?g\.?|picogram)?/gi,
        /\bmch\b(?!\s*c)[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'mchc',
      patterns: [
        /(?:mchc|m\.?c\.?h\.?c\.?|mean\s*corpuscular\s*h[ae]?moglobin\s*concentration|mean\s*cell\s*h[ae]?moglobin\s*conc)[\s:=\-—]*(\d+\.?\d*)\s*(?:g\/dl|g\s*\/\s*dl|gm\/dl|g%)?/gi,
        /\bmchc\b[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'rdw',
      patterns: [
        /(?:rdw|r\.?d\.?w\.?|red\s*(?:cell\s*)?distribution\s*width|rdw-cv|rdw-sd)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\brdw\b[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'neutrophils',
      patterns: [
        /(?:neutrophil(?:s)?|neut|n\.?e\.?u\.?t\.?|polymorphs?|pmn|segmented\s*neutrophil)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\bneut\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /neutrophil[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'lymphocytes',
      patterns: [
        /(?:lymphocyte(?:s)?|lymph|l\.?y\.?m\.?p\.?h\.?)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\blymph\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /lymphocyte[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'monocytes',
      patterns: [
        /(?:monocyte(?:s)?|mono|m\.?o\.?n\.?o\.?)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\bmono\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /monocyte[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'eosinophils',
      patterns: [
        /(?:eosinophil(?:s)?|eos|e\.?o\.?s\.?|eo)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\beos\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /eosinophil[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    },
    {
      parameter: 'basophils',
      patterns: [
        /(?:basophil(?:s)?|baso|b\.?a\.?s\.?o\.?|ba)[\s:=\-—]*(\d+\.?\d*)\s*%?/gi,
        /\bbaso\b[\s:=\-—]*(\d+\.?\d*)/gi,
        /basophil[\s:=\-—]*(\d+\.?\d*)/gi
      ]
    }
  ];
  
  // Multi-pass extraction strategy
  for (const {parameter, patterns: paramPatterns} of patterns) {
    let found = false;
    let bestMatch: {value: string, unit: string, confidence: number} | null = null;
    
    // Pass 1: Line-by-line strict matching
    for (const line of lines) {
      if (found) break;
      
      for (const pattern of paramPatterns) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          const value = match[1];
          
          // Validate numeric value
          const numValue = parseFloat(value);
          if (!value || isNaN(numValue) || numValue < 0) continue;
          
          // Context-based unit detection
          const lineText = line.toLowerCase();
          let unit = detectUnit(parameter, lineText, value);
          
          // Sanity check: validate value range
          if (isValuePlausible(parameter, numValue, unit)) {
            const confidence = calculateConfidence(line, parameter, value);
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = { value, unit, confidence };
            }
          }
        }
      }
    }
    
    // Pass 2: Multi-line context search if not found
    if (!bestMatch && normalizedText.includes(parameter)) {
      const contextPattern = new RegExp(`${parameter}[\\s\\S]{0,50}?(\\d+\\.?\\d*)`, 'gi');
      const contextMatches = [...normalizedText.matchAll(contextPattern)];
      
      for (const match of contextMatches) {
        const value = match[1];
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          const context = match[0];
          const unit = detectUnit(parameter, context, value);
          if (isValuePlausible(parameter, numValue, unit)) {
            bestMatch = { value, unit, confidence: 0.7 };
            break;
          }
        }
      }
    }
    
    if (bestMatch) {
      console.log(`Found ${parameter}: ${bestMatch.value} ${bestMatch.unit} (confidence: ${bestMatch.confidence.toFixed(2)})`);
      results.push({ parameter, value: bestMatch.value, unit: bestMatch.unit });
    }
  }
  
  console.log('Total extracted medical values:', results.length);
  return results;
};

// Helper: Detect unit from context
const detectUnit = (parameter: string, context: string, value: string): string => {
  const ctx = context.toLowerCase();
  
  if (parameter === 'wbc' || parameter === 'platelets') {
    if (ctx.includes('×10³') || ctx.includes('x10³') || ctx.includes('10³') || ctx.includes('thousand')) {
      return '10³/µL';
    } else if (ctx.includes('/µl') || ctx.includes('/ul') || ctx.includes('cumm') || ctx.includes('per µl')) {
      return '/µL';
    }
    return '10³/µL';
  }
  
  if (parameter === 'rbc') return '10⁶/µL';
  if (parameter === 'hemoglobin' || parameter === 'mchc') return 'g/dL';
  if (parameter === 'hematocrit' || parameter.includes('phil') || parameter.includes('cyte')) return '%';
  if (parameter === 'mcv') return 'fL';
  if (parameter === 'mch') return 'pg';
  if (parameter === 'rdw') return '%';
  
  return '';
};

// Helper: Validate if value is in plausible range
const isValuePlausible = (parameter: string, value: number, unit: string): boolean => {
  const ranges: Record<string, [number, number]> = {
    'wbc': [1, 50],
    'rbc': [2, 8],
    'hemoglobin': [5, 25],
    'hematocrit': [20, 70],
    'platelets': [20, 1000],
    'mcv': [50, 150],
    'mch': [15, 50],
    'mchc': [20, 40],
    'rdw': [8, 25],
    'neutrophils': [0, 100],
    'lymphocytes': [0, 100],
    'monocytes': [0, 100],
    'eosinophils': [0, 100],
    'basophils': [0, 100]
  };
  
  const range = ranges[parameter];
  if (!range) return true;
  
  return value >= range[0] && value <= range[1];
};

// Helper: Calculate extraction confidence
const calculateConfidence = (line: string, parameter: string, value: string): number => {
  let confidence = 0.5;
  const lower = line.toLowerCase();
  
  // Exact parameter name match
  if (lower.includes(parameter)) confidence += 0.2;
  
  // Has unit in same line
  if (lower.match(/\b(?:g\/dl|fl|pg|%|µl|cumm|10³|10⁶)\b/)) confidence += 0.15;
  
  // Value has decimal point (more precise)
  if (value.includes('.')) confidence += 0.1;
  
  // Contains colon or equals (key-value format)
  if (lower.match(/[:=]/)) confidence += 0.05;
  
  return Math.min(confidence, 1.0);
};
