#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadSpec } from './spec/loadSpec.js';
import { isFileAllowed, isCommandAllowed } from './policy/policyEngine.js';

const argv = yargs(hideBin(process.argv))
  .option('spec', {
    alias: 's',
    type: 'string',
    description: 'Path to the task spec YAML file',
    demandOption: true,
    requiresArg: true,
  })
  .option('check-file', {
    type: 'string',
    description: 'Check if a file path is allowed',
    requiresArg: true,
  })
  .option('check-cmd', {
    type: 'string',
    description: 'Check if a command is allowed',
    requiresArg: true,
  })
  .help()
  .parseSync();

try {
  const spec = loadSpec(argv.spec);

  // If --check-file is provided, test file policy
  if (argv['check-file']) {
    const decision = isFileAllowed(
      argv['check-file'],
      spec.scope.files_allowlist,
      spec.scope.files_denylist
    );

    if (decision.allowed) {
      console.log('FILE ALLOWED');
      console.log(decision.reason);
      process.exit(0);
    } else {
      console.log('FILE BLOCKED');
      console.log(decision.reason);
      process.exit(2);
    }
  }

  // If --check-cmd is provided, test command policy
  if (argv['check-cmd']) {
    const decision = isCommandAllowed(
      argv['check-cmd'],
      spec.scope.commands_allowlist,
      spec.scope.commands_denylist
    );

    if (decision.allowed) {
      console.log('CMD ALLOWED');
      console.log(decision.reason);
      process.exit(0);
    } else {
      console.log('CMD BLOCKED');
      console.log(decision.reason);
      process.exit(2);
    }
  }

  // If neither flag provided, just validate spec
  console.log('SPEC VALID');
  process.exit(0);
} catch (error) {
  console.error('SPEC INVALID');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error occurred');
  }
  process.exit(1);
}
