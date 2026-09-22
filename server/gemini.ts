import { GoogleGenAI, Type } from '@google/genai';
import { GrokRegexResult } from './grok.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const err = new Error('GEMINI_API_KEY_MISSING');
    (err as any).statusCode = 400;
    throw err;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export async function generateRegexWithGemini(
  description: string,
  userFlags: string
): Promise<GrokRegexResult> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `Generate a regular expression matching the user description: "${description}". Flags requested: "${userFlags}".`,
    config: {
      systemInstruction: `You are an elite regular expression engineer. Output valid JSON matching the schema.
Ensure the pattern is valid JavaScript RegExp syntax without wrapping slashes. Provide a clear explanation, detailed token breakdown, and both matching and non-matching test examples.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pattern: {
            type: Type.STRING,
            description: 'The regex pattern source without delimiters or flags',
          },
          flags: {
            type: Type.STRING,
            description: 'Recommended flags such as g, gi, etc.',
          },
          explanation: {
            type: Type.STRING,
            description: 'Clear plain-English explanation of how the pattern works',
          },
          components: {
            type: Type.ARRAY,
            description: 'Component-by-component token breakdown',
            items: {
              type: Type.OBJECT,
              properties: {
                token: { type: Type.STRING },
                meaning: { type: Type.STRING },
              },
              required: ['token', 'meaning'],
            },
          },
          examples: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              non_matches: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['matches', 'non_matches'],
          },
        },
        required: ['pattern', 'flags', 'explanation', 'components', 'examples'],
      },
    },
  });

  const rawText = response.text || '';
  try {
    const parsed = JSON.parse(rawText.trim());
    let pattern = parsed.pattern || '';
    if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
      pattern = pattern.substring(1, pattern.lastIndexOf('/'));
    }
    return {
      pattern,
      flags: parsed.flags || userFlags || 'g',
      explanation: parsed.explanation || '',
      components: Array.isArray(parsed.components) ? parsed.components : [],
      examples: {
        matches: Array.isArray(parsed.examples?.matches) ? parsed.examples.matches : [],
        non_matches: Array.isArray(parsed.examples?.non_matches) ? parsed.examples.non_matches : [],
      },
      parseError: false,
      rawOutput: rawText,
    };
  } catch (err: any) {
    return {
      pattern: '',
      flags: userFlags || 'g',
      explanation: 'Failed to parse Gemini response',
      components: [],
      examples: { matches: [], non_matches: [] },
      parseError: true,
      rawOutput: rawText,
    };
  }
}

export interface GeneratedDocSpec {
  markdown: string;
  jsdoc: string;
  python: string;
  openApi: string;
  edgeCases: string[];
  complexityScore: 'Low' | 'Moderate' | 'High';
  reDosSafe: boolean;
  notes: string;
}

export async function generateDocSpecWithGemini(
  pattern: string,
  flags: string,
  description?: string
): Promise<GeneratedDocSpec> {
  const ai = getGeminiClient();

  const prompt = `Analyze this regular expression and produce an extensive engineering documentation specification.
Regex: /${pattern}/${flags || ''}
${description ? `Context/Description: ${description}` : ''}

Evaluate:
1. Architectural purpose and edge cases
2. Catastrophic backtracking / ReDoS safety
3. Clean JSDoc TypeScript snippet
4. Markdown documentation specification with tables
5. Python re docstring
6. OpenAPI/JSON Schema`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: `You are a Principal Software Engineer and Regular Expressions specialist. Return pure JSON matching the response schema.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          markdown: {
            type: Type.STRING,
            description: 'Complete GitHub-compatible Markdown documentation specification',
          },
          jsdoc: {
            type: Type.STRING,
            description: 'TypeScript/JSDoc comment block with typed function and examples',
          },
          python: {
            type: Type.STRING,
            description: 'Python re.compile module snippet with docstring and doctests',
          },
          openApi: {
            type: Type.STRING,
            description: 'JSON Schema/OpenAPI schema snippet for this pattern',
          },
          edgeCases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of notable edge cases, boundaries, or limitations',
          },
          complexityScore: {
            type: Type.STRING,
            description: 'Complexity rating: Low, Moderate, or High',
          },
          reDosSafe: {
            type: Type.BOOLEAN,
            description: 'True if pattern is safe against catastrophic backtracking (ReDoS)',
          },
          notes: {
            type: Type.STRING,
            description: 'Engineering notes and optimization recommendations',
          },
        },
        required: [
          'markdown',
          'jsdoc',
          'python',
          'openApi',
          'edgeCases',
          'complexityScore',
          'reDosSafe',
          'notes',
        ],
      },
    },
  });

  const rawText = response.text || '{}';
  const parsed = JSON.parse(rawText.trim());
  return {
    markdown: parsed.markdown || '',
    jsdoc: parsed.jsdoc || '',
    python: parsed.python || '',
    openApi: parsed.openApi || '',
    edgeCases: Array.isArray(parsed.edgeCases) ? parsed.edgeCases : [],
    complexityScore: parsed.complexityScore || 'Moderate',
    reDosSafe: Boolean(parsed.reDosSafe),
    notes: parsed.notes || '',
  };
}
