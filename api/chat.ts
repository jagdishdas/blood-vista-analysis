// Converted to Node.js serverless function for better reliability
// Prevents timeout issues with long AI responses and streaming
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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
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
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      return new Response(JSON.stringify({
        error: 'No response generated. Please try rephrasing your question or try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ content, provider: 'openai' }), {
      status: 200,
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
