import { DocTemplate } from '../types';

export const CURATED_DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 'email-rfc5322',
    title: 'RFC 5322 Email Validator',
    category: 'Web & URLs',
    difficulty: 'Intermediate',
    description: 'Production-ready email address validator supporting standard user, domain, subdomains, and plus-addressing.',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'i',
    tags: ['email', 'validation', 'forms', 'auth'],
    author: 'curated',
    notes: 'Handles 99.9% of real-world email addresses. Avoids exotic quoted-string edge cases that cause catastrophic backtracking.',
    components: [
      { token: '^', meaning: 'Start of input string anchor' },
      { token: '[a-zA-Z0-9._%+-]+', meaning: 'One or more valid local-part characters (letters, digits, dots, underscores, plus)' },
      { token: '@', meaning: 'Literal at-symbol delimiter' },
      { token: '[a-zA-Z0-9.-]+', meaning: 'One or more hostname/domain labels with hyphens and dots' },
      { token: '\\.', meaning: 'Literal dot before top-level domain (TLD)' },
      { token: '[a-zA-Z]{2,}', meaning: 'Top-level domain of at least 2 alpha characters (e.g. .com, .org, .co.uk)' },
      { token: '$', meaning: 'End of input string anchor' },
    ],
    examples: {
      matches: [
        'developer@company.io',
        'sarah.connor+alerts@sub.domain.co.uk',
        'user_name99@service-provider.net',
      ],
      non_matches: [
        'invalid.user@.com',
        '@missing-local.org',
        'spaces in@email.com',
        'user@domain..com',
      ],
    },
    sampleTestText: `Contact addresses:
- Primary: support@regexfinesse.dev
- Billing: billing-team+sub@company.co.uk
- Invalid: user@.invalid, @no-user.com, test@domain`,
  },
  {
    id: 'password-policy',
    title: 'Strong Password Policy Validator',
    category: 'Auth & Security',
    difficulty: 'Advanced',
    description: 'Enforces strong passwords: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    tags: ['password', 'security', 'auth', 'lookahead'],
    author: 'curated',
    notes: 'Uses positive lookahead assertions (?=...) to ensure all 4 character classes are present anywhere in the string.',
    components: [
      { token: '^', meaning: 'Start of password' },
      { token: '(?=.*[a-z])', meaning: 'Lookahead: contains at least one lowercase letter' },
      { token: '(?=.*[A-Z])', meaning: 'Lookahead: contains at least one uppercase letter' },
      { token: '(?=.*\\d)', meaning: 'Lookahead: contains at least one numerical digit' },
      { token: '(?=.*[@$!%*?&])', meaning: 'Lookahead: contains at least one special character' },
      { token: '[A-Za-z\\d@$!%*?&]{8,}', meaning: 'Allowed characters list, minimum 8 total characters' },
      { token: '$', meaning: 'End of password' },
    ],
    examples: {
      matches: ['P@ssw0rd2026', 'Str0ng!Secur1ty', 'C0d1ng#Rules'],
      non_matches: ['alllowercase1!', 'NOLOWER123!', 'NoNumber!@#', 'Short1!'],
    },
    sampleTestText: `Test passwords:
P@ssw0rd2026 (valid)
Str0ng!Secur1ty (valid)
weakpass (invalid: too short, no upper/number/symbol)
AllUpper123! (valid)
NoSpecialChar123 (invalid)`,
  },
  {
    id: 'url-parser',
    title: 'Complete URL & Protocol Parser',
    category: 'Web & URLs',
    difficulty: 'Intermediate',
    description: 'Matches http/https/ftp URLs with optional port, subpaths, query parameters, and hash fragments.',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    tags: ['url', 'web', 'http', 'links'],
    author: 'curated',
    notes: 'Well-suited for text scraping and markdown link extraction.',
    components: [
      { token: 'https?:\\/\\/', meaning: 'Protocol (http:// or https://)' },
      { token: '(?:www\\.)?', meaning: 'Optional www. subdomain prefix' },
      { token: '[-a-zA-Z0-9@:%._\\+~#=]{1,256}', meaning: 'Domain name host segment up to 256 chars' },
      { token: '\\.[a-zA-Z0-9()]{1,6}\\b', meaning: 'Top-level domain (1-6 chars)' },
      { token: '(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)', meaning: 'Optional path, query params (?q=1&v=2), and hash fragment' },
    ],
    examples: {
      matches: [
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        'http://example.com:8080/api/v1/search?term=regex#top',
        'https://sub.domain.co/path/index.html',
      ],
      non_matches: ['htt://broken.url', 'just-text.com', 'ftp//missing-colon.org'],
    },
    sampleTestText: `Resources list:
1. Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript
2. Sandbox API: http://example.com:8080/api/v1/search?term=regex#top
3. Homepage: https://regexfinesse.dev
4. Invalid: ftp//bad, just-plain-text`,
  },
  {
    id: 'ipv4-strict',
    title: 'IPv4 Address (0-255 Range Validated)',
    category: 'Networking',
    difficulty: 'Intermediate',
    description: 'Matches IPv4 dotted-quad addresses with exact 0 to 255 numerical bounds checking on each octet.',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    tags: ['ipv4', 'networking', 'ip', 'server'],
    author: 'curated',
    notes: 'Prevents numbers like 256 or 999 from matching as valid IP addresses.',
    components: [
      { token: '\\b', meaning: 'Word boundary to prevent matching substrings of numbers' },
      { token: '25[0-5]', meaning: 'Matches range 250 to 255' },
      { token: '2[0-4][0-9]', meaning: 'Matches range 200 to 249' },
      { token: '[01]?[0-9][0-9]?', meaning: 'Matches range 0 to 199 (1 or 2 digits)' },
      { token: '\\.', meaning: 'Literal dot delimiter between octets' },
      { token: '{3}', meaning: 'Repeats the octet and dot exactly 3 times' },
    ],
    examples: {
      matches: ['192.168.1.1', '10.0.0.254', '127.0.0.1', '255.255.255.0'],
      non_matches: ['256.100.0.1', '192.168.1.999', '12.34.56', '1.2.3.4.5'],
    },
    sampleTestText: `Gateway configuration:
- Local loopback: 127.0.0.1
- Primary DNS: 8.8.8.8
- Router IP: 192.168.0.1
- Broadcast: 255.255.255.255
- Invalid probes: 999.12.34.56, 256.0.0.1, 10.0.0.500`,
  },
  {
    id: 'ipv6-address',
    title: 'IPv6 Address (Full & Compressed)',
    category: 'Networking',
    difficulty: 'Advanced',
    description: 'Matches full 8-hextet or shorthand compressed IPv6 addresses including loopback ::1.',
    pattern: '\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}|::1\\b',
    flags: 'g',
    tags: ['ipv6', 'networking', 'ip', 'protocols'],
    author: 'curated',
    notes: 'Handles both full notation and zero-compressed double-colon (::) representations.',
    components: [
      { token: '[0-9a-fA-F]{1,4}', meaning: '1 to 4 hexadecimal digits per hextet' },
      { token: ':', meaning: 'Colon delimiter between hextets' },
      { token: '::', meaning: 'Compressed zero series notation' },
      { token: '::1', meaning: 'Loopback address' },
    ],
    examples: {
      matches: [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        'fe80::1ff:fe23:4567:890a',
        '::1',
      ],
      non_matches: ['1200::AB00:1234::2552', '2001:xyz::1', ':::'],
    },
    sampleTestText: `Network interfaces:
Interface 1: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
Link-local: fe80::1ff:fe23:4567:890a
Loopback: ::1
Malformed: 2001:xyz::1`,
  },
  {
    id: 'semver-spec',
    title: 'Semantic Versioning (SemVer 2.0)',
    category: 'Data Formats',
    difficulty: 'Intermediate',
    description: 'Matches strict SemVer 2.0 specifications (MAJOR.MINOR.PATCH) with optional pre-release identifiers (-alpha.1) and build metadata (+20260624).',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    flags: '',
    tags: ['semver', 'versioning', 'packages', 'npm'],
    author: 'curated',
    notes: 'Official regex recommended by semver.org to disallow leading zeros on numbers.',
    components: [
      { token: '(0|[1-9]\\d*)', meaning: 'Major version number (no leading zero unless 0)' },
      { token: '\\.', meaning: 'Dot delimiter' },
      { token: '(0|[1-9]\\d*)', meaning: 'Minor version number' },
      { token: '\\.', meaning: 'Dot delimiter' },
      { token: '(0|[1-9]\\d*)', meaning: 'Patch version number' },
      { token: '(?:-((?:...)))?', meaning: 'Optional pre-release tag (e.g. -rc.1, -beta.2)' },
      { token: '(?:\\+((?:...)))?', meaning: 'Optional build metadata (e.g. +build.123)' },
    ],
    examples: {
      matches: ['1.0.0', '2.4.1-alpha.3', '10.2.0-beta+exp.sha.5114f85', '0.3.0'],
      non_matches: ['01.0.0', '1.2', 'v1.0.0', '1.2.3.4'],
    },
    sampleTestText: `Releases catalog:
- 1.0.0 (stable release)
- 2.4.1-alpha.3 (pre-release build)
- 10.2.0-beta+exp.sha.5114f85 (with metadata)
- 01.2.3 (invalid: leading zero)
- 1.2 (invalid: missing patch)`,
  },
  {
    id: 'uuid-v4',
    title: 'UUID v4 (Globally Unique Identifier)',
    category: 'Data Formats',
    difficulty: 'Beginner',
    description: 'Validates canonical 36-character UUID Version 4 strings with the version digit 4 and variant bits (8, 9, a, or b).',
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
    flags: '',
    tags: ['uuid', 'guid', 'ids', 'database'],
    author: 'curated',
    notes: 'Strictly verifies UUID v4 requirements according to RFC 4122.',
    components: [
      { token: '^[0-9a-fA-F]{8}-', meaning: '8 hex characters followed by hyphen' },
      { token: '[0-9a-fA-F]{4}-', meaning: '4 hex characters followed by hyphen' },
      { token: '4[0-9a-fA-F]{3}-', meaning: 'Must start with digit 4 (version 4) followed by 3 hex characters' },
      { token: '[89abAB][0-9a-fA-F]{3}-', meaning: 'Variant bits 8, 9, a, or b followed by 3 hex characters' },
      { token: '[0-9a-fA-F]{12}$', meaning: 'Final node segment of 12 hex characters' },
    ],
    examples: {
      matches: [
        'c89694b8-2a1d-4eb7-a548-2895f32ea62d',
        '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
        '00000000-0000-4000-8000-000000000000',
      ],
      non_matches: [
        'c89694b8-2a1d-3eb7-a548-2895f32ea62d', // v3, not v4
        'not-a-valid-uuid-string-here',
        'c89694b82a1d4eb7a5482895f32ea62d',
      ],
    },
    sampleTestText: `User IDs:
User 1: c89694b8-2a1d-4eb7-a548-2895f32ea62d
User 2: 6ba7b810-9dad-41d1-80b4-00c04fd430c8
Non-v4: c89694b8-2a1d-3eb7-a548-2895f32ea62d (v3)
Invalid: 12345-6789-000`,
  },
  {
    id: 'iso-8601-timestamp',
    title: 'ISO 8601 Timestamp (UTC & Offsets)',
    category: 'Dates & Times',
    difficulty: 'Intermediate',
    description: 'Matches standard ISO 8601 timestamps like 2026-09-21T18:30:00.000Z or with timezone offset (+02:00 / -07:00).',
    pattern: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-][01]\\d:[0-5]\\d)$',
    flags: '',
    tags: ['iso8601', 'datetime', 'timestamps', 'api'],
    author: 'curated',
    notes: 'Handles leap seconds and millisecond fractional seconds cleanly.',
    components: [
      { token: '^\\d{4}-', meaning: '4-digit year followed by hyphen' },
      { token: '(?:0[1-9]|1[0-2])-', meaning: '2-digit month (01-12) followed by hyphen' },
      { token: '(?:0[1-9]|[12]\\d|3[01])', meaning: '2-digit day (01-31)' },
      { token: 'T', meaning: 'Literal date-time separator T' },
      { token: '(?:[01]\\d|2[0-3]):', meaning: '2-digit hour (00-23) with colon' },
      { token: '[0-5]\\d:', meaning: '2-digit minute (00-59) with colon' },
      { token: '[0-5]\\d', meaning: '2-digit second (00-59)' },
      { token: '(?:\\.\\d+)?', meaning: 'Optional fractional sub-seconds (.123)' },
      { token: '(?:Z|[+-][01]\\d:[0-5]\\d)$', meaning: 'UTC marker (Z) or timezone offset (e.g. +05:30, -07:00)' },
    ],
    examples: {
      matches: [
        '2026-09-21T18:30:00Z',
        '2026-12-31T23:59:59.999Z',
        '2025-06-15T08:15:30+02:00',
      ],
      non_matches: [
        '2026-13-01T00:00:00Z',
        '2026-02-30 12:00:00',
        '2026/09/21T18:30:00Z',
      ],
    },
    sampleTestText: `Audit records:
Event A: 2026-09-21T18:30:00Z
Event B: 2026-12-31T23:59:59.999Z
Event C: 2025-06-15T08:15:30+02:00
Bad timestamp: 2026-99-99T99:99:99Z`,
  },
  {
    id: 'jwt-token',
    title: 'JWT (JSON Web Token) Structure',
    category: 'Auth & Security',
    difficulty: 'Intermediate',
    description: 'Matches standard 3-part base64url JSON Web Tokens separated by dots: header.payload.signature.',
    pattern: '^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$',
    flags: '',
    tags: ['jwt', 'auth', 'tokens', 'oauth'],
    author: 'curated',
    notes: 'Handles standard base64url characters (- and _) and optional padding (=).',
    components: [
      { token: '^[A-Za-z0-9-_=]+', meaning: 'Base64URL encoded JSON Header' },
      { token: '\\.', meaning: 'Dot separator 1' },
      { token: '[A-Za-z0-9-_=]+', meaning: 'Base64URL encoded Claims Payload' },
      { token: '\\.?', meaning: 'Dot separator 2' },
      { token: '[A-Za-z0-9-_.+/=]*$', meaning: 'Base64/Base64URL Cryptographic Signature' },
    ],
    examples: {
      matches: [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      ],
      non_matches: [
        'headeronlystring',
        'header.payloadwithoutsignature',
        'has spaces.in the.token',
      ],
    },
    sampleTestText: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
Malformed token: abc.def`,
  },
  {
    id: 'hex-color',
    title: 'Hexadecimal Color (#RGB, #RRGGBB, #RRGGBBAA)',
    category: 'Data Formats',
    difficulty: 'Beginner',
    description: 'Matches 3, 4, 6, or 8-digit hexadecimal CSS color codes with leading hashtag.',
    pattern: '^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
    flags: 'i',
    tags: ['color', 'css', 'hex', 'design'],
    author: 'curated',
    notes: 'Supports modern alpha channel notations (#RGBA and #RRGGBBAA).',
    components: [
      { token: '^#', meaning: 'Leading hashtag' },
      { token: '[0-9a-fA-F]{3,4}', meaning: '3 or 4-digit shorthand (RGB or RGBA)' },
      { token: '|', meaning: 'Or' },
      { token: '[0-9a-fA-F]{6}', meaning: '6-digit standard notation (RRGGBB)' },
      { token: '|', meaning: 'Or' },
      { token: '[0-9a-fA-F]{8}', meaning: '8-digit notation with alpha channel (RRGGBBAA)' },
    ],
    examples: {
      matches: ['#fff', '#06b6d4', '#13141a', '#ff000080', '#0f0c'],
      non_matches: ['#12', '#12345', 'ffffff', '#ggg'],
    },
    sampleTestText: `Palette tokens:
- Primary: #06b6d4
- Dark background: #13141a
- Translucent: #ff000080
- White: #fff
- Invalid: #12, #xyz, 123456`,
  },
  {
    id: 'markdown-link-extractor',
    title: 'Markdown Links & Images Parser',
    category: 'Text Extraction',
    difficulty: 'Intermediate',
    description: 'Extracts markdown links and images [label](url "optional title") capturing both the label text and URL destination in separate capture groups.',
    pattern: '!?\\[([^\\]]+)\\]\\(([^\\s\\)]+)(?:\\s+"([^"]+)")?\\)',
    flags: 'g',
    tags: ['markdown', 'text', 'parser', 'links'],
    author: 'curated',
    notes: 'Group 1 contains label, Group 2 contains URL, Group 3 contains optional hover title.',
    components: [
      { token: '!?\\[', meaning: 'Optional exclamation mark for images, followed by opening bracket' },
      { token: '([^\\]]+)', meaning: 'Capture Group 1: Link label text' },
      { token: '\\]\\(', meaning: 'Closing bracket and opening parenthesis' },
      { token: '([^\\s\\)]+)', meaning: 'Capture Group 2: URL destination target' },
      { token: '(?:\\s+"([^"]+)")?', meaning: 'Capture Group 3 (optional): Hover title inside quotes' },
      { token: '\\)', meaning: 'Closing parenthesis' },
    ],
    examples: {
      matches: [
        '[Google](https://google.com)',
        '![Logo](/images/logo.png "Company Logo")',
        '[Read the Docs](https://docs.example.com/api)',
      ],
      non_matches: ['[Unclosed bracket(http://foo)', 'plain text link', '(no label)'],
    },
    sampleTestText: `Welcome to our platform!
Please review [Our Documentation](https://docs.example.com) for setup details.
See the preview diagram below:
![Architecture diagram](/assets/arch.svg "System Layout")
Report issues at [GitHub](https://github.com/example/repo).`,
  },
  {
    id: 'cron-expression',
    title: 'Cron Schedule (5-Part Standard)',
    category: 'Dates & Times',
    difficulty: 'Advanced',
    description: 'Validates standard 5-field cron schedule expressions (Minute Hour Day-of-Month Month Day-of-Week).',
    pattern: '^((\\*|[0-5]?\\d)(\\/[0-5]?\\d)?)\\s+((\\*|(1[0-2]|0?[1-9]))(\\/[1-2]?\\d)?)\\s+((\\*|([12]?\\d|3[01]))(\\/[12]?\\d)?)\\s+((\\*|(1[0-2]|0?[1-9]))(\\/[1-2]?\\d)?)\\s+((\\*|[0-6])(\\/[0-6])?)$',
    flags: '',
    tags: ['cron', 'scheduler', 'devops', 'backend'],
    author: 'curated',
    notes: 'Supports asterisks, numeric values, and step intervals (e.g. */5, */15).',
    components: [
      { token: 'Field 1', meaning: 'Minutes (0-59 or * or */n)' },
      { token: 'Field 2', meaning: 'Hours (0-23 or * or */n)' },
      { token: 'Field 3', meaning: 'Day of month (1-31 or * or */n)' },
      { token: 'Field 4', meaning: 'Month (1-12 or * or */n)' },
      { token: 'Field 5', meaning: 'Day of week (0-6 Sunday to Saturday or * or */n)' },
    ],
    examples: {
      matches: ['*/5 * * * *', '0 12 * * 1', '30 2 1 * *', '* * * * *'],
      non_matches: ['60 * * * *', '* * * 13 *', '* * * *', '0 0 0 0 0 0'],
    },
    sampleTestText: `Backup schedules:
- Every 5 minutes: */5 * * * *
- Every Monday at noon: 0 12 * * 1
- Monthly on 1st at 02:30: 30 2 1 * *
- Malformed: 60 * * * *, * * * *`,
  },
  {
    id: 'slug-permalink',
    title: 'URL Slug / Kebab-Case Identifier',
    category: 'Web & URLs',
    difficulty: 'Beginner',
    description: 'Validates SEO-friendly URL slugs consisting of lowercase letters, digits, and single hyphens without consecutive or trailing hyphens.',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    flags: '',
    tags: ['slug', 'seo', 'urls', 'blog'],
    author: 'curated',
    notes: 'Ensures slugs do not start or end with a hyphen or contain consecutive dashes (--).',
    components: [
      { token: '^[a-z0-9]+', meaning: 'Starts with one or more lowercase alphanumeric characters' },
      { token: '(?:-[a-z0-9]+)*$', meaning: 'Followed by zero or more hyphen-delimited words' },
    ],
    examples: {
      matches: ['my-first-post', 'building-react-apps-2026', 'seo-guide', 'post1'],
      non_matches: ['My-Post', '-starts-with-dash', 'trailing-dash-', 'double--dashes'],
    },
    sampleTestText: `Article slugs:
- my-first-blog-post
- learn-regular-expressions-in-2026
- release-v2-notes
Invalid slugs:
- Bad-Capital-Slug
- trailing-hyphen-
- double--dash`,
  },
  {
    id: 'html-tag-extractor',
    title: 'HTML Tag & Attribute Extractor',
    category: 'Text Extraction',
    difficulty: 'Intermediate',
    description: 'Matches opening and self-closing HTML tags, extracting the tag name and inner attribute string.',
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b([^>]*?)(\\/?)>',
    flags: 'g',
    tags: ['html', 'scraping', 'parser', 'tags'],
    author: 'curated',
    notes: 'Captures Tag name in Group 1, Attribute block in Group 2, and self-closing slash in Group 3.',
    components: [
      { token: '<', meaning: 'Opening angle bracket' },
      { token: '([a-zA-Z][a-zA-Z0-9]*)', meaning: 'Group 1: Tag name (starts with letter)' },
      { token: '\\b([^>]*?)', meaning: 'Group 2: Attributes block' },
      { token: '(\\/?)>', meaning: 'Group 3: Optional self-closing slash and closing angle bracket' },
    ],
    examples: {
      matches: [
        '<div class="container" id="main">',
        '<img src="photo.jpg" alt="Photo" />',
        '<span>',
      ],
      non_matches: ['< 5', '<>', 'plain text < 100 > other'],
    },
    sampleTestText: `Rendered snippet:
<div class="card" id="card-1">
  <h2 class="title">Header</h2>
  <img src="banner.png" alt="Cover" />
</div>`,
  },
  {
    id: 'mac-address',
    title: 'MAC Address (Colon or Hyphen Separated)',
    category: 'Networking',
    difficulty: 'Beginner',
    description: 'Validates 48-bit Media Access Control (MAC) hardware addresses in standard 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E notation.',
    pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
    flags: '',
    tags: ['mac', 'hardware', 'networking', 'eui48'],
    author: 'curated',
    notes: 'Enforces consistent delimiter (: or -) across all 6 octets.',
    components: [
      { token: '^([0-9A-Fa-f]{2}[:-]){5}', meaning: '5 pairs of hex digits followed by colon or hyphen' },
      { token: '([0-9A-Fa-f]{2})$', meaning: 'Final 6th pair of hex digits' },
    ],
    examples: {
      matches: ['00:1A:2B:3C:4D:5E', '00-50-56-C0-00-08', 'aa:bb:cc:dd:ee:ff'],
      non_matches: ['00:1A:2B:3C:4D', '00:1A:2B:3C:4D:5E:6F', '00:GG:2B:3C:4D:5E'],
    },
    sampleTestText: `Network adapter list:
- Ethernet: 00:1A:2B:3C:4D:5E
- Wi-Fi: 00-50-56-C0-00-08
- Bluetooth: aa:bb:cc:dd:ee:ff
- Corrupt address: 00:GG:2B:3C:4D:5E`,
  },
  {
    id: 'bearer-token-header',
    title: 'HTTP Bearer Authorization Header',
    category: 'Auth & Security',
    difficulty: 'Beginner',
    description: 'Extracts the secret token from an HTTP Authorization header formatted as "Bearer <token>".',
    pattern: '^Bearer\\s+([A-Za-z0-9-._~+/]+=*)$',
    flags: 'i',
    tags: ['bearer', 'http', 'auth', 'security'],
    author: 'curated',
    notes: 'Complies with RFC 6750 Bearer Token specification.',
    components: [
      { token: '^Bearer', meaning: 'Literal prefix Bearer (case-insensitive)' },
      { token: '\\s+', meaning: 'One or more whitespace characters' },
      { token: '([A-Za-z0-9-._~+/]+=*)', meaning: 'Group 1: Base64/URL safe token string' },
      { token: '$', meaning: 'End of string' },
    ],
    examples: {
      matches: [
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'bearer token_1234567890abcdef',
      ],
      non_matches: ['Basic dXNlcjpwYXNz', 'Bearer', 'TokenOnlyNoBearer'],
    },
    sampleTestText: `Incoming HTTP requests:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Authorization: bearer secret-token-42
Invalid: Basic user:pass, Bearer`,
  },
];

export const CATEGORY_LIST: { id: string; label: string; icon: string }[] = [
  { id: 'All', label: 'All Templates', icon: 'Layers' },
  { id: 'Web & URLs', label: 'Web & URLs', icon: 'Globe' },
  { id: 'Auth & Security', label: 'Auth & Security', icon: 'Shield' },
  { id: 'Data Formats', label: 'Data Formats', icon: 'FileCode' },
  { id: 'Networking', label: 'Networking', icon: 'Cpu' },
  { id: 'Dates & Times', label: 'Dates & Times', icon: 'Calendar' },
  { id: 'Text Extraction', label: 'Text Extraction', icon: 'ScanText' },
  { id: 'Custom', label: 'My Saved Templates', icon: 'BookmarkCheck' },
];
