import { existsSync } from 'fs';
import { program } from 'commander';

import { getLogger } from '../modules/logging.js';

const log = getLogger('validate');

program.argument('<input>', '.puff file to validate').parse();

try {
  const [inputPath] = program.args;

  if (!existsSync(inputPath)) {
    throw new Error(`${inputPath} does not exist!`);
  }

  // todo: actual validation
  log.info('Validated successfully!');
} catch (error) {
  console.error(error);
  process.exit(1);
}
