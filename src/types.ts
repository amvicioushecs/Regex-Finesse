export interface RegexFlags {
  g: boolean; // global
  i: boolean; // ignoreCase
  m: boolean; // multiline
  s: boolean; // dotAll
  u: boolean; // unicode
}

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

export interface PresetSample {
  id: string;
  title: string;
  description: string;
  prompt: string;
  sampleText: string;
  flags: RegexFlags;
}

export interface MatchCaptureGroup {
  index: number;
  name?: string;
  content: string;
}

export type DocCategory =
  | 'All'
  | 'Web & URLs'
  | 'Auth & Security'
  | 'Data Formats'
  | 'Networking'
  | 'Dates & Times'
  | 'Text Extraction'
  | 'Custom';

export type DocFormat = 'markdown' | 'jsdoc' | 'python' | 'go' | 'openapi';

export interface DocTemplate {
  id: string;
  title: string;
  category: Exclude<DocCategory, 'All'>;
  description: string;
  pattern: string;
  flags: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  components: RegexComponent[];
  examples: RegexExamples;
  sampleTestText: string;
  author: 'curated' | 'user';
  createdAt?: string;
  notes?: string;
}

export interface GeminiDocResult {
  markdown: string;
  jsdoc: string;
  python: string;
  openApi: string;
  edgeCases?: string[];
  complexityScore?: 'Low' | 'Moderate' | 'High';
  reDosSafe?: boolean;
  notes?: string;
}

