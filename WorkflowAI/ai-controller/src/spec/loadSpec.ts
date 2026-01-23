import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { TaskSpecSchema, TaskSpec } from './schema.js';
import { ZodError } from 'zod';

/**
 * Formats a Zod error into a human-readable message
 */
function formatZodError(error: ZodError): string {
  const messages: string[] = [];

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    let message = `  ${path}: `;

    if (issue.code === 'invalid_type') {
      message += `expected ${issue.expected}, received ${issue.received}`;
    } else if (issue.code === 'invalid_literal') {
      message += `expected "${issue.expected}", received "${issue.received}"`;
    } else if (issue.code === 'too_small') {
      if (issue.type === 'array') {
        message += `array must contain at least ${issue.minimum} element(s)`;
      } else {
        message += `value must be >= ${issue.minimum}`;
      }
    } else if (issue.code === 'custom') {
      message += issue.message || 'validation failed';
    } else {
      message += issue.message || 'validation failed';
    }

    messages.push(message);
  }

  return messages.join('\n');
}

/**
 * Loads and validates a task spec YAML file
 * @param filePath Path to the YAML file
 * @returns Validated TaskSpec object
 * @throws Error if file cannot be read, YAML is invalid, or validation fails
 */
export function loadSpec(filePath: string): TaskSpec {
  let content: string;
  let parsed: unknown;

  // Read file
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read spec file: ${error.message}`);
    }
    throw new Error(`Failed to read spec file: ${filePath}`);
  }

  // Parse YAML
  try {
    parsed = parse(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse YAML: ${error.message}`);
    }
    throw new Error('Failed to parse YAML: unknown error');
  }

  // Validate with Zod
  const result = TaskSpecSchema.safeParse(parsed);

  if (!result.success) {
    const errorMessage = formatZodError(result.error);
    throw new Error(`Spec validation failed:\n${errorMessage}`);
  }

  return result.data;
}
