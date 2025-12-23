import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// System prompt for BloodVista Assistant
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

Supported Blood Tests:
- Complete Blood Count (CBC)
- Hemoglobin
- White Blood Cells (WBC)
- Red Blood Cells (RBC)
- Platelets
- Liver Function Tests
- Kidney Function Tests
- Lipid Profile
- Blood Sugar/Glucose
- Thyroid Function Tests

Guidelines:
1. Be helpful, friendly, and informative
2. Explain blood test concepts in simple, understandable terms
3. Always remind users that you provide educational information only
4. Never provide medical diagnoses or treatment recommendations
5. Encourage users to consult healthcare professionals for medical concerns
6. Help users navigate the BloodVista application
7. Answer questions about blood test reference ranges and what results mean

Important Disclaimer: BloodVista provides educational information only and is not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis and treatment.

When users ask about their specific results, help them understand what the values mean in general terms, but always emphasize consulting a doctor for personalized medical advice.`;

// Provider configurations
type AIProvider = 'lovable' | 'openai' | 'gemini' | 'claude';

interface ProviderConfig {
  url: string;
  model: string;
  getHeaders: (apiKey: string) => Record<string, string>;
  formatBody: (messages: any[], stream: boolean) => any;
}

const providerConfigs: Record<AIProvider, ProviderConfig> = {
  lovable: {
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    model: "google/gemini-2.5-flash",
    getHeaders: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages: any[], stream: boolean) => ({
      model: "google/gemini-2.5-flash",
      messages,
      stream,
    }),
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    getHeaders: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages: any[], stream: boolean) => ({
      model: "gpt-4o-mini",
      messages,
      stream,
    }),
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    getHeaders: (apiKey: string) => ({
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    }),
    formatBody: (messages: any[], _stream: boolean) => ({
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : 'user',
        parts: [{ text: m.content }]
      })),
    }),
  },
  claude: {
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-3-haiku-20240307",
    getHeaders: (apiKey: string) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    formatBody: (messages: any[], stream: boolean) => {
      const systemMsg = messages.find(m => m.role === 'system');
      const otherMsgs = messages.filter(m => m.role !== 'system');
      return {
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: systemMsg?.content || SYSTEM_PROMPT,
        messages: otherMsgs,
        stream,
      };
    },
  },
};

// Get API key for provider
const getApiKey = (provider: AIProvider): string | null => {
  switch (provider) {
    case 'lovable':
      return Deno.env.get('LOVABLE_API_KEY') || null;
    case 'openai':
      return Deno.env.get('OPENAI_API_KEY') || Deno.env.get('AI_API_KEY') || null;
    case 'gemini':
      return Deno.env.get('GEMINI_API_KEY') || Deno.env.get('AI_API_KEY') || null;
    case 'claude':
      return Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('AI_API_KEY') || null;
    default:
      return null;
  }
};

// Parse response based on provider
const parseResponse = async (response: Response, provider: AIProvider): Promise<string> => {
  const data = await response.json();
  
  switch (provider) {
    case 'gemini':
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    case 'claude':
      return data.content?.[0]?.text || '';
    default: // lovable, openai
      return data.choices?.[0]?.message?.content || '';
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider = 'lovable', stream = false } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activeProvider = provider as AIProvider;
    const config = providerConfigs[activeProvider];
    
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = getApiKey(activeProvider);
    
    if (!apiKey) {
      // Fallback to Lovable AI if no API key configured
      if (activeProvider !== 'lovable') {
        const lovableKey = Deno.env.get('LOVABLE_API_KEY');
        if (lovableKey) {
          console.log(`No API key for ${activeProvider}, falling back to Lovable AI`);
          const fallbackConfig = providerConfigs.lovable;
          const fullMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
          ];
          
          const response = await fetch(fallbackConfig.url, {
            method: "POST",
            headers: fallbackConfig.getHeaders(lovableKey),
            body: JSON.stringify(fallbackConfig.formatBody(fullMessages, stream)),
          });
          
          if (stream && response.body) {
            return new Response(response.body, {
              headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
            });
          }
          
          const content = await parseResponse(response, 'lovable');
          return new Response(
            JSON.stringify({ content, provider: 'lovable' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: `API key not configured for ${activeProvider}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare messages with system prompt
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    // Make request to AI provider
    const response = await fetch(config.url, {
      method: "POST",
      headers: config.getHeaders(apiKey),
      body: JSON.stringify(config.formatBody(fullMessages, stream)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${activeProvider} API error:`, response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please check your AI service quota." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle streaming response (only for OpenAI-compatible providers)
    if (stream && (activeProvider === 'lovable' || activeProvider === 'openai') && response.body) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Parse non-streaming response
    const content = await parseResponse(response, activeProvider);
    
    return new Response(
      JSON.stringify({ content, provider: activeProvider }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("BloodVista chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
