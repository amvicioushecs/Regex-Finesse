/**
 * Server-side helper to interface with xAI Responses API (grok-4.5)
 * Never expose XAI_API_KEY to the browser.
 */

export interface RegexComponent {
  token: string;
  meaning: string;
}

export interface RegexExamples {
  matches: string[];
  non_matches: string[];
}

export interface GrokRegexResult {
  pattern: string;
  flags: string;
  explanation: string;
  components: RegexComponent[];
  examples: RegexExamples;
  parseError?: boolean;
  rawOutput?: string;
  apiError?: string;
  statusCode?: number;
}

export async function generateRegexWithGrok(
  description: string,
  userFlags: string
): Promise<GrokRegexResult> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'xai-...') {
    const err = new Error('XAI_API_KEY_MISSING');
    (err as any).statusCode = 400;
    throw err;
  }

  const prompt = `You are a regular expression expert. Generate a working regular expression based on the user's request.

User Description: "${description}"
Requested Flags: "${userFlags}"

Requirements:
1. Return STRICT JSON ONLY. Do NOT include markdown code fences (no \`\`\`json or \`\`\`), no HTML, and no prose or conversational text before or after the JSON.
2. The response MUST match this exact JSON schema:

{
  "pattern": "the regex source without delimiters or flags",
  "flags": "the recommended flags, for example gi",
  "explanation": "plain-English description of what the regex matches",
  "components": [
    { "token": "a piece of the pattern", "meaning": "what that piece does" }
  ],
  "examples": {
    "matches": ["string that should match", "another match"],
    "non_matches": ["string that should not match"]
  }
}

Guidelines for pattern:
- The "pattern" value MUST NOT include wrapping slashes / / or trailing flags.
- Ensure the pattern is valid JavaScript RegExp syntax.
- Make the component breakdown detailed and beginner-friendly.`;

  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-4.5',
      input: prompt,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    let errorMsg = `xAI API HTTP Error ${status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg += `: ${typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error)}`;
      } else if (errJson && errJson.message) {
        errorMsg += `: ${errJson.message}`;
      }
    } catch {
      // Ignore JSON parse failure for error response
    }
    const error = new Error(errorMsg) as any;
    error.statusCode = status;
    throw error;
  }

  const data = await response.json();

  // Read model response from output_text when present.
  // If canonical Responses shape, extract and join text from output[].content[] entries where type === "output_text"
  let rawText = '';
  if (data.output_text && typeof data.output_text === 'string') {
    rawText = data.output_text;
  } else if (Array.isArray(data.output)) {
    const parts: string[] = [];
    for (const item of data.output) {
      if (item && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content.type === 'output_text' && content.text) {
            parts.push(content.text);
          } else if (content.type === 'text' && content.text) {
            parts.push(content.text);
          }
        }
      }
    }
    rawText = parts.join('');
  }

  if (!rawText && typeof data === 'object') {
    rawText = JSON.stringify(data);
  }

  return parseGrokRegexResponse(rawText);
}

export function parseGrokRegexResponse(rawText: string): GrokRegexResult {
  const trimmed = rawText.trim();

  // Attempt 1: Direct JSON.parse
  try {
    const parsed = JSON.parse(trimmed);
    if (isValidResultShape(parsed)) {
      return sanitizeResult(parsed, trimmed);
    }
  } catch {
    // Continue to next attempt
  }

  // Attempt 2: Strip markdown code fences (e.g. ```json ... ```)
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (isValidResultShape(parsed)) {
      return sanitizeResult(parsed, trimmed);
    }
  } catch {
    // Continue to next attempt
  }

  // Attempt 3: Extract from first { to last }
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const substring = stripped.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(substring);
      if (isValidResultShape(parsed)) {
        return sanitizeResult(parsed, trimmed);
      }
    } catch {
      // Continue to fallback
    }
  }

  // Fallback: Return raw text with parse error indicator without crashing
  return {
    pattern: '',
    flags: 'g',
    explanation: 'Model output could not be parsed as structured JSON.',
    components: [],
    examples: { matches: [], non_matches: [] },
    parseError: true,
    rawOutput: rawText,
  };
}

function isValidResultShape(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    (typeof obj.pattern === 'string' || typeof obj.explanation === 'string')
  );
}

function sanitizeResult(obj: any, rawText: string): GrokRegexResult {
  let pattern = typeof obj.pattern === 'string' ? obj.pattern : '';
  // Strip leading/trailing slashes if the model wrapped pattern in slashes /.../
  if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
    const lastSlash = pattern.lastIndexOf('/');
    pattern = pattern.substring(1, lastSlash);
  }

  return {
    pattern,
    flags: typeof obj.flags === 'string' ? obj.flags : 'g',
    explanation: typeof obj.explanation === 'string' ? obj.explanation : '',
    components: Array.isArray(obj.components)
      ? obj.components.map((c: any) => ({
          token: String(c.token || ''),
          meaning: String(c.meaning || ''),
        }))
      : [],
    examples: {
      matches: Array.isArray(obj.examples?.matches)
        ? obj.examples.matches.map(String)
        : [],
      non_matches: Array.isArray(obj.examples?.non_matches)
        ? obj.examples.non_matches.map(String)
        : [],
    },
    parseError: false,
    rawOutput: rawText,
  };
}
