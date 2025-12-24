import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AnalysisResult {
  summary: string;
  findings: {
    category: string;
    description: string;
    severity: 'normal' | 'mild' | 'moderate' | 'severe';
    confidence: number;
  }[];
  confidenceScore: number;
  provider: string;
  disclaimer: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, scanType, fileName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!scanType || !['xray', 'ct', 'mri'].includes(scanType)) {
      return res.status(400).json({ error: 'Invalid scan type. Must be xray, ct, or mri' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    console.log(`Processing ${scanType} scan: ${fileName}`);

    const systemPrompt = `You are a medical imaging AI assistant specialized in radiology analysis. 
You analyze ${scanType.toUpperCase()} images and provide structured findings.
IMPORTANT: Your analysis is for educational/informational purposes only and NOT a medical diagnosis.
Always recommend consulting a qualified healthcare professional.

Respond with a JSON object containing:
- summary: A brief overview of what you observe (2-3 sentences)
- findings: An array of findings, each with:
  - category: The anatomical area or finding type
  - description: Detailed description of the finding
  - severity: One of "normal", "mild", "moderate", or "severe"
  - confidence: Your confidence level from 0.0 to 1.0
- confidenceScore: Overall confidence in the analysis (0.0 to 1.0)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${scanType.toUpperCase()} scan and provide your findings in JSON format.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid API key.' });
      }
      
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in AI response' });
    }

    const parsed = JSON.parse(content);

    const result: AnalysisResult = {
      summary: parsed.summary || 'Analysis completed.',
      findings: parsed.findings || [],
      confidenceScore: parsed.confidenceScore || 0.75,
      provider: 'openai',
      disclaimer: 'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.'
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Radiology analysis error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to analyze the radiology image'
    });
  }
}
