export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { imageBase64, scanType, fileName } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!scanType || !['xray', 'ct', 'mri'].includes(scanType)) {
      return new Response(JSON.stringify({ error: 'Invalid scan type. Must be xray, ct, or mri' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = (process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a medical imaging AI assistant specialized in radiology analysis.
Analyze ${String(scanType).toUpperCase()} images and return structured findings.
IMPORTANT: educational only, not a diagnosis.

Return JSON with: summary, findings[{category,description,severity,confidence}], confidenceScore.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this ${String(scanType).toUpperCase()} scan and respond in JSON.` },
              {
                type: 'image_url',
                image_url: {
                  url: String(imageBase64).startsWith('data:')
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(JSON.stringify({ error: 'No content in AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(content);

    const result: AnalysisResult = {
      summary: parsed.summary || 'Analysis completed.',
      findings: parsed.findings || [],
      confidenceScore: parsed.confidenceScore || 0.75,
      provider: 'openai',
      disclaimer:
        'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional.',
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Radiology analysis error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to analyze the radiology image',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
}
