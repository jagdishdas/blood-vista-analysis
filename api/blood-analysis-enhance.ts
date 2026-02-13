const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

interface MedicalResult {
    parameterId: string;
    value: number;
    unit: string;
    status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
    flags?: string[];
}

interface EnhancementRequest {
    testType: string;
    results: MedicalResult[];
    relationshipFlags?: string[];
    patientContext: {
        age: number;
        gender: 'male' | 'female';
        conditions?: string[];
    };
}

interface EnhancementResponse {
    enhancedSummary: {
        en: string;
        ur: string;
    };
    keyInsights: string[];
    recommendations: {
        en: string[];
        ur: string[];
    };
    provider: 'gemini' | 'openai';
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
        const requestData: EnhancementRequest = await req.json();
        const { testType, results, relationshipFlags = [], patientContext } = requestData;

        if (!results || !Array.isArray(results) || results.length === 0) {
            return new Response(JSON.stringify({ error: 'No results provided' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Get API keys
        const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
        const openaiApiKey = (process.env.OPENAI_API_KEY || '').trim();

        // Try Gemini first (cheaper and faster)
        if (geminiApiKey) {
            try {
                console.log('Using Gemini for blood analysis enhancement...');
                const response = await enhanceWithGemini(geminiApiKey, testType, results, relationshipFlags, patientContext);
                return new Response(JSON.stringify(response), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (geminiError) {
                console.error('Gemini enhancement failed:', geminiError);
                // Fall through to OpenAI
                if (!openaiApiKey) {
                    throw geminiError;
                }
            }
        }

        // Fallback to OpenAI
        if (openaiApiKey) {
            console.log('Using OpenAI for blood analysis enhancement...');
            const response = await enhanceWithOpenAI(openaiApiKey, testType, results, relationshipFlags, patientContext);
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // No API keys configured
        return new Response(JSON.stringify({
            error: 'No AI provider configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Blood analysis enhancement error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Enhancement failed',
                details: 'Please check server logs for more information.'
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
}

// Build system prompt with validated results
function buildSystemPrompt(
    testType: string,
    results: MedicalResult[],
    relationshipFlags: string[],
    patientContext: { age: number; gender: string; conditions?: string[] }
): string {
    const criticalResults = results.filter(r => r.status === 'CRITICAL' || r.flags?.includes('CRITICAL'));
    const abnormalResults = results.filter(r => r.status !== 'NORMAL');

    const resultsText = results.map(r => {
        const flagsText = r.flags && r.flags.length > 0 ? ` [${r.flags.join(', ')}]` : '';
        return `- ${r.parameterId}: ${r.value} ${r.unit} (STATUS: ${r.status}${flagsText})`;
    }).join('\n');

    const relationshipsText = relationshipFlags.length > 0
        ? `\n\nDETECTED PATTERNS:\n${relationshipFlags.map(f => `- ${f}`).join('\n')}`
        : '';

    return `You are a medical AI assistant analyzing ${testType.toUpperCase()} blood test results.

PATIENT CONTEXT:
- Age: ${patientContext.age} years
- Gender: ${patientContext.gender}
${patientContext.conditions ? `- Medical conditions: ${patientContext.conditions.join(', ')}` : ''}

VALIDATED RESULTS:
${resultsText}
${relationshipsText}

CRITICAL RULES (NON-NEGOTIABLE):
1. RESPECT the validated STATUS for each parameter (NORMAL/LOW/HIGH/CRITICAL)
2. NEVER contradict the validation engine
3. ${criticalResults.length > 0 ? 'CRITICAL VALUES DETECTED - Emphasize URGENT medical consultation needed' : 'No critical values detected'}
4. Identify cross-parameter patterns (e.g., "iron deficiency anemia" when hemoglobin LOW + ferritin LOW + TIBC HIGH)
5. Provide actionable insights beyond "this value is high/low"
6. Use simple, everyday language - explain medical terms in parentheses
7. Be empathetic and supportive - users may be anxious
8. Always include disclaimer that this is educational information, not diagnosis

TASK:
Generate an intelligent, comprehensive analysis in JSON format:
{
  "summaryEn": "2-3 paragraph narrative in English explaining what these results mean together, potential conditions, and what to do next",
  "summaryUr": "Same narrative in Urdu (if you can generate Urdu, otherwise return empty string)",
  "keyInsights": ["insight 1", "insight 2", "insight 3"] // 3-5 bullet points of critical findings,
  "recommendationsEn": ["recommendation 1", "recommendation 2"] // Specific action items in English,
  "recommendationsUr": ["recommendation 1", "recommendation 2"] // Same in Urdu (or empty if not possible)
}

Focus on:
- Explaining patterns and relationships between parameters
- Identifying potential medical conditions (with disclaimer)
- Prioritizing critical/abnormal findings
- Providing lifestyle recommendations
- Answering "what should I do next?"
- Being reassuring for normal results, serious for critical ones`;
}

// Enhance with Gemini
async function enhanceWithGemini(
    apiKey: string,
    testType: string,
    results: MedicalResult[],
    relationshipFlags: string[],
    patientContext: { age: number; gender: string; conditions?: string[] }
): Promise<EnhancementResponse> {
    const systemPrompt = buildSystemPrompt(testType, results, relationshipFlags, patientContext);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nRespond ONLY with valid JSON. No markdown formatting.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.4,
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
        enhancedSummary: {
            en: parsed.summaryEn || 'Analysis complete.',
            ur: parsed.summaryUr || '',
        },
        keyInsights: parsed.keyInsights || [],
        recommendations: {
            en: parsed.recommendationsEn || [],
            ur: parsed.recommendationsUr || [],
        },
        provider: 'gemini',
    };
}

// Enhance with OpenAI
async function enhanceWithOpenAI(
    apiKey: string,
    testType: string,
    results: MedicalResult[],
    relationshipFlags: string[],
    patientContext: { age: number; gender: string; conditions?: string[] }
): Promise<EnhancementResponse> {
    const systemPrompt = buildSystemPrompt(testType, results, relationshipFlags, patientContext);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a medical AI assistant. Respond only with valid JSON.' },
                { role: 'user', content: systemPrompt }
            ],
            temperature: 0.4,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);

    return {
        enhancedSummary: {
            en: parsed.summaryEn || 'Analysis complete.',
            ur: parsed.summaryUr || '',
        },
        keyInsights: parsed.keyInsights || [],
        recommendations: {
            en: parsed.recommendationsEn || [],
            ur: parsed.recommendationsUr || [],
        },
        provider: 'openai',
    };
}
