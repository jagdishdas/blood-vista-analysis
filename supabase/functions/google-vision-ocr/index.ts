import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create JWT for Google Cloud authentication
async function createJWT(serviceAccountEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiry

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
    scope: "https://www.googleapis.com/auth/cloud-vision"
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import the private key and sign
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  return `${signatureInput}.${encodedSignature}`;
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Get access token from JWT
async function getAccessToken(jwt: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token exchange failed with status:", response.status);
    console.error("Error response:", error);
    console.error("JWT length:", jwt.length);
    console.error("Response headers:", Object.fromEntries(response.headers.entries()));
    throw new Error(`Failed to get access token (HTTP ${response.status}): ${error.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Call Google Cloud Vision API
async function performOCR(imageBase64: string, accessToken: string): Promise<any> {
  const requestBody = {
    requests: [{
      image: { content: imageBase64 },
      features: [
        { type: "TEXT_DETECTION", maxResults: 50 },
        { type: "DOCUMENT_TEXT_DETECTION", maxResults: 50 }
      ],
      imageContext: {
        languageHints: ["en", "ur"]
      }
    }]
  };

  const response = await fetch("https://vision.googleapis.com/v1/images:annotate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Vision API failed:", error);
    throw new Error(`Vision API error: ${error}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get service account credentials from environment
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
    const privateKey = Deno.env.get('GOOGLE_CLOUD_PRIVATE_KEY');
    const clientEmail = Deno.env.get('GOOGLE_CLOUD_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      console.error("Missing Google Cloud credentials");
      return new Response(
        JSON.stringify({ error: "Google Cloud credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fix escaped newlines in private key (robust handling for env vars)
    let formattedPrivateKey = privateKey
      .replace(/\\n/g, '\n')   // Handle escaped newlines
      .replace(/\\r/g, '')      // Remove escaped carriage returns
      .trim();

    // Validate private key format
    if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----') ||
      !formattedPrivateKey.includes('-----END PRIVATE KEY-----')) {
      console.error('Invalid private key format: Missing BEGIN/END markers');
      console.error('Key length:', privateKey.length);
      console.error('First 50 chars:', privateKey.substring(0, 50));
      return new Response(
        JSON.stringify({
          error: 'Invalid private key format. Ensure key includes BEGIN/END PRIVATE KEY markers.',
          hint: 'Check that newlines are preserved in the environment variable'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Creating JWT for service account:", clientEmail);

    let jwt: string;
    try {
      jwt = await createJWT(clientEmail, formattedPrivateKey);
    } catch (error) {
      console.error("JWT creation failed:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
      return new Response(
        JSON.stringify({
          error: 'Failed to create JWT for authentication',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Exchanging JWT for access token...");
    const accessToken = await getAccessToken(jwt);

    console.log("Calling Google Cloud Vision API...");
    const visionResponse = await performOCR(imageBase64, accessToken);

    // Extract text from response
    let extractedText = "";
    let confidence = 0;

    if (visionResponse.responses && visionResponse.responses[0]) {
      const response = visionResponse.responses[0];

      // Prefer fullTextAnnotation for better structure
      if (response.fullTextAnnotation) {
        extractedText = response.fullTextAnnotation.text || "";
        // Calculate average confidence
        const pages = response.fullTextAnnotation.pages || [];
        let totalConfidence = 0;
        let blockCount = 0;
        for (const page of pages) {
          for (const block of page.blocks || []) {
            if (block.confidence) {
              totalConfidence += block.confidence;
              blockCount++;
            }
          }
        }
        confidence = blockCount > 0 ? (totalConfidence / blockCount) * 100 : 95;
      } else if (response.textAnnotations && response.textAnnotations.length > 0) {
        extractedText = response.textAnnotations[0].description || "";
        confidence = 90; // Default confidence for simple text detection
      }

      if (response.error) {
        console.error("Vision API response error:", response.error);
        throw new Error(response.error.message);
      }
    }

    console.log("OCR completed successfully. Text length:", extractedText.length);
    console.log("Confidence:", confidence);

    return new Response(
      JSON.stringify({
        text: extractedText,
        confidence: confidence,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in google-vision-ocr function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
