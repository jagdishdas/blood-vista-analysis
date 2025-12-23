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

Important Disclaimer: BloodVista provides educational information only and is not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis and treatment.`;

// Provider configurations
type AIProvider = 'openai' | 'gemini' | 'claude';

interface ProviderConfig {
  url: string;
  model: string;
  getHeaders: (apiKey: string) => Record<string, string>;
  formatBody: (messages: any[], stream: boolean) => any;
  parseResponse: (data: any) => string;
}

const providerConfigs: Record<AIProvider, ProviderConfig> = {
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
      max_tokens: 1024,
    }),
    parseResponse: (data: any) => data.choices?.[0]?.message?.content || '',
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    getHeaders: (apiKey: string) => ({
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    }),
    formatBody: (messages: any[], _stream: boolean) => {
      // Convert messages to Gemini format
      const contents = [];
      let systemContent = '';
      
      for (const m of messages) {
        if (m.role === 'system') {
          systemContent = m.content;
        } else {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.role === 'user' && systemContent && contents.length === 0 
              ? `${systemContent}\n\n${m.content}` 
              : m.content }]
          });
        }
      }
      
      return { contents };
    },
    parseResponse: (data: any) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
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
    parseResponse: (data: any) => data.content?.[0]?.text || '',
  },
};

// Get API key for provider
const getApiKey = (provider: AIProvider): string | null => {
  switch (provider) {
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

// Determine which provider to use based on available API keys
const getActiveProvider = (requestedProvider?: string): AIProvider | null => {
  // If a specific provider is requested and has an API key, use it
  if (requestedProvider && requestedProvider in providerConfigs) {
    const provider = requestedProvider as AIProvider;
    if (getApiKey(provider)) {
      return provider;
    }
  }
  
  // Otherwise, find the first provider with an available API key
  const providers: AIProvider[] = ['openai', 'gemini', 'claude'];
  for (const provider of providers) {
    if (getApiKey(provider)) {
      return provider;
    }
  }
  
  return null;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider: requestedProvider, stream = false } = await req.json();
    
    console.log("BloodVista Chat request received:", { 
      messageCount: messages?.length, 
      requestedProvider, 
      stream 
    });

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages array");
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activeProvider = getActiveProvider(requestedProvider);
    
    if (!activeProvider) {
      console.error("No AI provider API key configured");
      return new Response(
        JSON.stringify({ 
          error: "No AI provider configured. Please set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY in your environment variables." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Using AI provider:", activeProvider);
    
    const config = providerConfigs[activeProvider];
    const apiKey = getApiKey(activeProvider)!;

    // Prepare messages with system prompt
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    // Make request to AI provider
    console.log("Calling AI API:", config.url);
    
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
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your configuration." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle streaming response (only for OpenAI)
    if (stream && activeProvider === 'openai' && response.body) {
      console.log("Returning streaming response");
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Parse non-streaming response
    const data = await response.json();
    const content = config.parseResponse(data);
    
    console.log("AI response received, length:", content.length);
    
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