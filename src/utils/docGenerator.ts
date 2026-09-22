import { DocTemplate, DocFormat } from '../types';

/**
 * Generates documentation strings across multiple formats for any regular expression template.
 */

function sanitizePatternName(title: string): string {
  return title
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function generateDocContent(template: DocTemplate, format: DocFormat): string {
  switch (format) {
    case 'markdown':
      return generateMarkdownSpec(template);
    case 'jsdoc':
      return generateJSDoc(template);
    case 'python':
      return generatePythonDoc(template);
    case 'go':
      return generateGoDoc(template);
    case 'openapi':
      return generateOpenApiSchema(template);
    default:
      return generateMarkdownSpec(template);
  }
}

export function generateMarkdownSpec(template: DocTemplate): string {
  const tokenRows = template.components && template.components.length > 0
    ? template.components
        .map((c) => `| \`${c.token.replace(/\|/g, '\\|')}\` | ${c.meaning} |`)
        .join('\n')
    : '| `(pattern)` | Full regular expression match |';

  const matchesList = template.examples?.matches && template.examples.matches.length > 0
    ? template.examples.matches.map((m) => `- ✅ \`${m}\``).join('\n')
    : '- *(None listed)*';

  const nonMatchesList = template.examples?.non_matches && template.examples.non_matches.length > 0
    ? template.examples.non_matches.map((m) => `- ❌ \`${m}\``).join('\n')
    : '- *(None listed)*';

  const notesSection = template.notes
    ? `\n### 🛡️ Security & Performance Notes\n> ${template.notes}\n`
    : '';

  return `## Specification: ${template.title}

> **Category**: ${template.category} | **Difficulty**: ${template.difficulty}
> 
> ${template.description}

### 📐 Regular Expression
\`\`\`regex
/${template.pattern}/${template.flags || ''}
\`\`\`

### 🧩 Token Breakdown
| Token / Group | Function & Semantics |
| :--- | :--- |
${tokenRows}

### 🧪 Test Suite & Validation Matrix
**Valid Inputs (Matches):**
${matchesList}

**Invalid Inputs (Non-Matches):**
${nonMatchesList}
${notesSection}
### 💻 Quick Implementation Snippet (JavaScript / TypeScript)
\`\`\`typescript
/**
 * ${template.title}
 * ${template.description}
 */
export const ${sanitizePatternName(template.title)}_REGEX = /${template.pattern}/${template.flags || ''};

export function isValid${sanitizePatternName(template.title).replace(/_([A-Z])/g, (_, l) => l)}(input: string): boolean {
  return ${sanitizePatternName(template.title)}_REGEX.test(input);
}
\`\`\`
`;
}

export function generateJSDoc(template: DocTemplate): string {
  const constName = `${sanitizePatternName(template.title)}_REGEX`;
  const fnName = `validate${sanitizePatternName(template.title).replace(/_([A-Z0-9])/g, (_, l) => l)}`;

  const examplesBlock = template.examples?.matches?.slice(0, 3).map(
    (ex) => ` * @example\n * ${constName}.test("${ex}"); // returns true`
  ).join('\n') || '';

  const nonExamplesBlock = template.examples?.non_matches?.slice(0, 2).map(
    (ex) => ` * @example\n * ${constName}.test("${ex}"); // returns false`
  ).join('\n') || '';

  return `/**
 * @fileoverview Regular expression specification for ${template.title}.
 * @category ${template.category}
 * @difficulty ${template.difficulty}
 */

/**
 * ${template.title}
 * 
 * ${template.description}
 * 
 * @constant {RegExp}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions}
${examplesBlock ? ` *\n${examplesBlock}` : ''}
${nonExamplesBlock ? ` *\n${nonExamplesBlock}` : ''}
 */
export const ${constName}: RegExp = /${template.pattern}/${template.flags || ''};

/**
 * Validates whether the given candidate string matches the ${template.title} specification.
 * 
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the string strictly matches the pattern.
 */
export function ${fnName}(input: string): boolean {
  if (typeof input !== 'string') return false;
  return ${constName}.test(input);
}
`;
}

export function generatePythonDoc(template: DocTemplate): string {
  const varName = `${sanitizePatternName(template.title)}_PATTERN`;
  const fnName = `is_valid_${sanitizePatternName(template.title).toLowerCase()}`;

  // Map JS flags to Python re flags
  const pyFlags: string[] = [];
  if (template.flags.includes('i')) pyFlags.push('re.IGNORECASE');
  if (template.flags.includes('m')) pyFlags.push('re.MULTILINE');
  if (template.flags.includes('s')) pyFlags.push('re.DOTALL');

  const flagsArg = pyFlags.length > 0 ? `, ${pyFlags.join(' | ')}` : '';

  return `"""
${template.title}
Category: ${template.category} (${template.difficulty})

${template.description}
"""

import re
from typing import Optional

# Compiled Regular Expression Pattern
${varName}: re.Pattern = re.compile(
    r"""${template.pattern}"""${flagsArg}
)


def ${fnName}(candidate: str) -> bool:
    """Validate whether candidate conforms to ${template.title}.

    Args:
        candidate (str): Input text to test.

    Returns:
        bool: True if input matches the regular expression.

    Examples:
${template.examples?.matches?.slice(0, 2).map((m) => `        >>> ${fnName}("${m}")\n        True`).join('\n') || ''}
${template.examples?.non_matches?.slice(0, 2).map((m) => `        >>> ${fnName}("${m}")\n        False`).join('\n') || ''}
    """
    if not isinstance(candidate, str):
        return False
    return bool(${varName}.search(candidate))
`;
}

export function generateGoDoc(template: DocTemplate): string {
  const varName = `${sanitizePatternName(template.title).replace(/_([A-Z0-9])/g, (_, l) => l)}Regex`;
  const fnName = `IsValid${sanitizePatternName(template.title).replace(/_([A-Z0-9])/g, (_, l) => l)}`;

  return `package validator

import "regexp"

// ${varName} matches ${template.title}.
// Category: ${template.category}
// Description: ${template.description}
var ${varName} = regexp.MustCompile(\`${template.pattern}\`)

// ${fnName} returns true if the input matches ${template.title}.
func ${fnName}(input string) bool {
    return ${varName}.MatchString(input)
}
`;
}

export function generateOpenApiSchema(template: DocTemplate): string {
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: template.title,
    description: template.description,
    type: 'string',
    pattern: template.pattern,
    examples: template.examples?.matches?.slice(0, 4) || [],
    'x-regex-category': template.category,
    'x-regex-difficulty': template.difficulty,
  };

  return JSON.stringify(schema, null, 2);
}
