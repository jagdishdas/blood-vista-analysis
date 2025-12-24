import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  imageBase64: string;
  scanType: 'xray' | 'ct' | 'mri';
  fileName: string;
}

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

// Get AI provider configuration
function getAIProvider(): { provider: string; apiKey: string } | null {
  // Check for radiology-specific keys first
  const radiologyKey = Deno.env.get('RADIOLOGY_AI_KEY');
  const radiologyProvider = Deno.env.get('RADIOLOGY_AI_PROVIDER');
  
  if (radiologyKey && radiologyProvider) {
    return { provider: radiologyProvider, apiKey: radiologyKey };
  }

  // Fall back to general AI keys
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (openaiKey) {
    return { provider: 'gpt-4o-mini', apiKey: openaiKey };
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (geminiKey) {
    return { provider: 'gemini', apiKey: geminiKey };
  }

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (anthropicKey) {
    return { provider: 'claude', apiKey: anthropicKey };
  }

  return null;
}

// Analyze with OpenAI Vision (GPT-4o-mini or GPT-4-vision)
async function analyzeWithOpenAI(imageBase64: string, scanType: string, apiKey: string): Promise<AnalysisResult> {
  console.log('Analyzing with OpenAI Vision...');
  
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
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  const parsed = JSON.parse(content);
  
  return {
    summary: parsed.summary || 'Analysis completed.',
    findings: parsed.findings || [],
    confidenceScore: parsed.confidenceScore || 0.75,
    provider: 'openai',
    disclaimer: 'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.'
  };
}

// Analyze with Google Gemini Vision
async function analyzeWithGemini(imageBase64: string, scanType: string, apiKey: string): Promise<AnalysisResult> {
  console.log('Analyzing with Google Gemini Vision...');
  
  const prompt = `You are a medical imaging AI assistant specialized in radiology analysis.
Analyze this ${scanType.toUpperCase()} scan image and provide structured findings.
IMPORTANT: Your analysis is for educational/informational purposes only and NOT a medical diagnosis.

Respond with a JSON object containing:
- summary: A brief overview (2-3 sentences)
- findings: Array of findings with category, description, severity (normal/mild/moderate/severe), confidence (0-1)
- confidenceScore: Overall confidence (0-1)

Respond ONLY with valid JSON, no markdown.`;

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content in Gemini response');
  }

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Gemini response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    summary: parsed.summary || 'Analysis completed.',
    findings: parsed.findings || [],
    confidenceScore: parsed.confidenceScore || 0.75,
    provider: 'gemini',
    disclaimer: 'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.'
  };
}

// Analyze with Anthropic Claude
async function analyzeWithClaude(imageBase64: string, scanType: string, apiKey: string): Promise<AnalysisResult> {
  console.log('Analyzing with Anthropic Claude Vision...');
  
  const prompt = `You are a medical imaging AI assistant specialized in radiology analysis.
Analyze this ${scanType.toUpperCase()} scan image and provide structured findings.
IMPORTANT: Your analysis is for educational/informational purposes only and NOT a medical diagnosis.

Respond with a JSON object containing:
- summary: A brief overview (2-3 sentences)
- findings: Array of findings with category, description, severity (normal/mild/moderate/severe), confidence (0-1)
- confidenceScore: Overall confidence (0-1)

Respond ONLY with valid JSON.`;

  // Format base64 for Claude
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  const mediaType = imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) {
    throw new Error('No content in Claude response');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    summary: parsed.summary || 'Analysis completed.',
    findings: parsed.findings || [],
    confidenceScore: parsed.confidenceScore || 0.75,
    provider: 'claude',
    disclaimer: 'This AI analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice.'
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, scanType, fileName }: AnalysisRequest = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!scanType || !['xray', 'ct', 'mri'].includes(scanType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid scan type. Must be xray, ct, or mri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${scanType} scan: ${fileName}`);

    // Get AI provider
    const providerConfig = getAIProvider();
    
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ 
          error: 'No AI provider configured. Please set RADIOLOGY_AI_KEY or one of: OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Using AI provider: ${providerConfig.provider}`);

    let result: AnalysisResult;

    // Route to appropriate provider
    const provider = providerConfig.provider.toLowerCase();
    
    if (provider.includes('gpt') || provider === 'openai') {
      result = await analyzeWithOpenAI(imageBase64, scanType, providerConfig.apiKey);
    } else if (provider.includes('gemini') || provider === 'google') {
      result = await analyzeWithGemini(imageBase64, scanType, providerConfig.apiKey);
    } else if (provider.includes('claude') || provider === 'anthropic') {
      result = await analyzeWithClaude(imageBase64, scanType, providerConfig.apiKey);
    } else {
      // Default to OpenAI if provider string is unrecognized but key exists
      result = await analyzeWithOpenAI(imageBase64, scanType, providerConfig.apiKey);
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Radiology analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to analyze the radiology image'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
