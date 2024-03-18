import { existsSync } from 'fs';
import { program } from 'commander';

import { getLogger } from '../modules/logging.js';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

const log = getLogger('validate');

program.argument('<input>', '.puff file to validate').parse();

try {
  const validLineRegex = /^(#.*|[WFP],[0-9.]+)$/;
  const [inputPath] = program.args;

  if (!existsSync(inputPath)) {
    throw new Error(`${inputPath} does not exist!`);
  }

  const rawText = await readFile(resolve(inputPath), 'utf-8');

  let i = 1,
    valid = true;
  for (const line of rawText.split(/\r?\n+/)) {
    if (line.length === 0) {
      i++;
      continue;
    }

    i++;

    if (!validLineRegex.test(line)) {
      log.error(`Line ${i}: Invalid format!`);
      valid |= false;
    }
  }

  if (valid) {
    log.info('Validated successfully!');
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
