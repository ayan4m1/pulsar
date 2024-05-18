#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';

try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const commandDir = resolve(__dirname, 'commands');
  const packageJsonPath = resolve(__dirname, '..', 'package.json');
  const { bin, description, version } = JSON.parse(
    await readFile(packageJsonPath, 'utf-8')
  );
  const [name] = Object.keys(bin);

  program
    .name(name)
    .version(version)
    .description(description)
    .executableDir(commandDir)
    .command('run', 'Play back a .puff file', {
      executableFile: 'run.js'
    })
    .command(
      'convert',
      'Convert an EScribe recorded puff .csv to a .puff file',
      {
        executableFile: 'convert.js'
      }
    )
    .command('validate', 'Validate a .puff file', {
      executableFile: 'validate.js'
    })
    .command('visualize', 'Produce an ASCII bar chart of a .puff file', {
      executableFile: 'visualize.js'
    })
    .parseAsync();
} catch (error) {
  console.error(error);
  process.exit(1);
}
