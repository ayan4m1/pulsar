import { program } from 'commander';

import { getLogger, validatePuff } from '../utils/index.js';

const log = getLogger('validate');

program.argument('<input>', '.puff file to validate').parse();

try {
  const [path] = program.args;

  await validatePuff(path);

  log.info('Validated successfully!');
} catch (error) {
  console.error(error);
  process.exit(1);
}
