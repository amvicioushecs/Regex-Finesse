import { PresetSample, RegexFlags } from '../types';

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'us-phone',
    title: 'US Phone Numbers',
    description: 'Match US phone numbers in formats like (415) 555-0132 or 415-555-0132',
    prompt: 'Match US phone numbers (e.g. (415) 555-0132, 415-555-0132)',
    sampleText: `Call our office at (415) 555-0132 or try cell 415-555-0199 for urgent inquiries.
International line: +1-800-555-0144 extension 12.
Direct extension line: 123-456-7890 ext 404.
Invalid numbers: 12-34-5678, 555-PHONE, or 0123456789.`,
    flags: { g: true, i: true, m: true, s: false, u: false },
  },
  {
    id: 'email-extract',
    title: 'Extract Emails',
    description: 'Extract valid email addresses from paragraphs or logs',
    prompt: 'Extract email addresses from a block of text',
    sampleText: `Contact support at support@regexfinesse.dev or sales.team@company.co.uk.
For urgent security notifications, write to security+alert@domain.org!
User feedback logged by admin_usr99@sub.service.io.
Invalid formats to ignore: user@.com, @missinguser.com, user.domain.com.`,
    flags: { g: true, i: true, m: false, s: false, u: false },
  },
  {
    id: 'iso-date',
    title: 'ISO 8601 Dates',
    description: 'Validate ISO 8601 formatted dates in YYYY-MM-DD format',
    prompt: 'Validate ISO 8601 dates (YYYY-MM-DD)',
    sampleText: `System release scheduled for 2026-06-24, followed by maintenance on 2026-12-31.
Project kickoff occurred on 2025-01-15.
Invalid dates: 2026/06/24, 24-06-2026, 2026-13-45, 202-1-1.`,
    flags: { g: true, i: false, m: true, s: false, u: false },
  },
];

export function flagsToString(flags: RegexFlags): string {
  let str = '';
  if (flags.g) str += 'g';
  if (flags.i) str += 'i';
  if (flags.m) str += 'm';
  if (flags.s) str += 's';
  if (flags.u) str += 'u';
  return str;
}

export function stringToFlags(flagsStr: string): RegexFlags {
  return {
    g: flagsStr.includes('g'),
    i: flagsStr.includes('i'),
    m: flagsStr.includes('m'),
    s: flagsStr.includes('s'),
    u: flagsStr.includes('u'),
  };
}
