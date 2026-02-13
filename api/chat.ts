const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are BloodVista Assistant, an expert AI medical education assistant for the BloodVista application.

BloodVista is a comprehensive blood test analysis platform that helps users understand their:
- Complete Blood Count (CBC) results
- Lipid Profile (cholesterol, triglycerides)
- Glucose and HbA1c tests
- Thyroid function tests (TSH, T3, T4)
- Liver function tests (ALT, AST, bilirubin)
- Kidney function tests (creatinine, eGFR, BUN)
- Cardiac markers (troponin, NT-proBNP)
- Inflammatory markers (CRP, ESR)
- Electrolytes and minerals
- Vitamins and deficiencies
- Hormonal tests
- Tumor markers
- Autoimmune markers
- Coagulation studies

Your role:
1. **Educate clearly**: Explain blood test parameters, reference ranges, and what results mean in simple, everyday language
2. **Provide context**: Help users understand the clinical significance of their results
3. **Be supportive**: Many users are anxious about their health - be reassuring while being accurate
4. **Actionable guidance**: Suggest lifestyle modifications, when to seek medical care, and what questions to ask their doctor
5. **Medical accuracy**: Use evidence-based information following international medical standards (WHO, AHA, ESC, NIH)

Critical guidelines:
- ALWAYS include a disclaimer that this is educational information, not medical diagnosis or treatment
- NEVER diagnose conditions - instead explain what patterns might suggest and recommend professional evaluation
- For critical or very abnormal values, strongly urge immediate medical attention
- Acknowledge limitations - you don't have the user's full medical history, medications, or examination findings
- Recommend consulting healthcare professionals for personalized medical advice
- When discussing medications or treatments, emphasize these should only be taken under medical supervision

Response style:
- Use clear, simple language avoiding excessive medical jargon
- When using medical terms, explain them in parentheses
- Be warm and empathetic
- Structure responses with bullet points or numbered lists when helpful
- Provide specific, actionable information when possible

IMPORTANT: Every response should end with a brief reminder that users should consult their healthcare provider for medical decisions.`;

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
    const { messages, medicalContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get API keys from environment
    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const openaiApiKey = (process.env.OPENAI_API_KEY || '').trim();

    // Try Gemini first if available, then fall back to OpenAI
    if (geminiApiKey) {
      try {
        console.log('Attempting to use Gemini API...');
        const geminiResponse = await callGeminiAPI(geminiApiKey, messages, medicalContext);
        return geminiResponse;
      } catch (geminiError) {
        console.error('Gemini API failed:', geminiError);
        // Fall through to OpenAI
        if (!openaiApiKey) {
          throw geminiError; // If no OpenAI key, throw the original error
        }
        console.log('Falling back to OpenAI API...');
      }
    }

    // Use OpenAI API
    if (openaiApiKey) {
      console.log('Using OpenAI API...');
      const openaiResponse = await callOpenAIAPI(openaiApiKey, messages, medicalContext);
      return openaiResponse;
    }

    // No API keys configured
    return new Response(JSON.stringify({
      error: 'No AI API keys configured. Please set either GEMINI_API_KEY or OPENAI_API_KEY in your environment variables.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat error:', error);

    // Provide more helpful error messages
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. The AI service is taking too long to respond. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
}

// Create system prompt with optional medical context injection
function createSystemPrompt(medicalContext?: any): string {
  let prompt = SYSTEM_PROMPT;

  if (medicalContext && medicalContext.results && medicalContext.results.length > 0) {
    prompt += `

[VALIDATED MEDICAL CONTEXT - STRICT]
The user has provided validated blood test results. You MUST respect these validated statuses:

`;

    medicalContext.results.forEach((result: any) => {
      const status = result.status || 'UNKNOWN';
      const flags = result.flags || [];
      prompt += `- ${result.parameterId}: ${result.value} ${result.unit} (Status: ${status}${flags.includes('CRITICAL') ? ' - CRITICAL' : ''})
`;
    });

    prompt += `
[SAFETY RULES - NON-NEGOTIABLE]
1. You MUST acknowledge the validated status (NORMAL/LOW/HIGH/CRITICAL) in your response.
2. If any parameter is marked CRITICAL, you MUST emphasize immediate medical consultation.
3. You MUST NOT contradict the validated status (e.g., if status=HIGH, don't say "levels are normal").
4. You MUST NOT provide specific medication advice or dosages.
5. For CRITICAL values, your tone must be serious and urgent.
6. Always remind users to consult healthcare professionals.
`;
  }

  return prompt;
}

// Call Gemini API
async function callGeminiAPI(apiKey: string, messages: any[], medicalContext?: any): Promise<Response> {
  // Convert messages to Gemini format
  const geminiMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  // Add system message with medical context as first user message
  const systemPrompt = createSystemPrompt(medicalContext);
  geminiMessages.unshift({
    role: 'user',
    parts: [{ text: systemPrompt }]
  });
  geminiMessages.splice(1, 0, {
    role: 'model',
    parts: [{ text: 'I understand. I will strictly follow these guidelines and respect all validated medical data in my responses.' }]
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!content) {
    throw new Error('No response generated from Gemini. Please try rephrasing your question.');
  }

  return new Response(JSON.stringify({ content, provider: 'gemini' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Call OpenAI API
async function callOpenAIAPI(apiKey: string, messages: any[], medicalContext?: any): Promise<Response> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: createSystemPrompt(medicalContext) }, ...messages],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }

    if (response.status === 402) {
      throw new Error('AI service quota exceeded. Please try again later.');
    }

    throw new Error('OpenAI API error');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('No response generated from OpenAI. Please try rephrasing your question.');
  }

  return new Response(JSON.stringify({ content, provider: 'openai' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
