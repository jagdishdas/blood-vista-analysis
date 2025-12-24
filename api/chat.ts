import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are BloodVista Assistant, an AI assistant for the BloodVista application.

About BloodVista:
BloodVista helps users understand their blood test results by providing easy-to-read analysis, reference ranges, and health insights.

Key Features:
- Upload blood test reports (PDF or images)
- Automatic OCR extraction of test values
- Complete Blood Count (CBC) analysis
- Comprehensive blood test analysis
- Color-coded results (normal, low, high)
- Reference range comparisons
- Health insights and recommendations

Guidelines:
1. Be helpful, friendly, and informative
2. Explain blood test concepts in simple, understandable terms
3. Always remind users that you provide educational information only
4. Never provide medical diagnoses or treatment recommendations
5. Encourage users to consult healthcare professionals for medical concerns

Important Disclaimer: BloodVista provides educational information only and is not a substitute for professional medical advice.`;

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
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 1024,
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
    const content = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ content, provider: 'openai' });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
