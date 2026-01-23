import { z } from 'zod';

// Agent preference enum
const AgentPreferenceSchema = z.enum(['claude', 'opencode', 'codex']);

// Mode enum
const ModeSchema = z.enum(['plan', 'build', 'review', 'verify']);

// Budget schema
const BudgetSchema = z
  .object({
    max_minutes: z.number().int().positive(),
    max_tool_cost_usd: z.number().nonnegative(),
    codex_break_glass: z.boolean(),
    break_glass_reason: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      // break_glass_reason is required if codex_break_glass is true
      if (data.codex_break_glass && !data.break_glass_reason) {
        return false;
      }
      return true;
    },
    {
      message: 'break_glass_reason is required when codex_break_glass is true',
      path: ['break_glass_reason'],
    }
  );

// Scope schema
const ScopeSchema = z
  .object({
    files_allowlist: z.array(z.string()).min(1),
    files_denylist: z.array(z.string()),
    commands_allowlist: z.array(z.string()),
    commands_denylist: z.array(z.string()),
  })
  .strict();

// Main Task Spec schema
export const TaskSpecSchema = z
  .object({
    spec_version: z.literal('1.0'),
    id: z.string(),
    title: z.string(),
    intent: z.string(),
    mode: ModeSchema,
    repo_root: z.string(),
    workdir: z.string(),
    agent_preference: z.array(AgentPreferenceSchema).min(1),
    budget: BudgetSchema,
    scope: ScopeSchema,
    acceptance_checks: z.array(z.string()).min(1),
    output_requirements: z.array(z.string()).min(1),
  })
  .strict();

export type TaskSpec = z.infer<typeof TaskSpecSchema>;
