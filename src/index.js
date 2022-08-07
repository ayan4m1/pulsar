import { Command } from 'commander';

import convert from './commands/convert.js';
import run from './commands/run.js';

const program = new Command();

program.name('pulsar').version('0.1.0').description('Scripted DNA control');

program
  .command('run')
  .description('Run a script')
  .argument('<path>', 'CSV script')
  .requiredOption('-p, --port <value>', 'Serial port')
  .action(run);

program
  .command('convert')
  .description('Converts an EScribe CSV to a script')
  .argument('<input>', 'Input CSV from EScribe')
  .argument('<output>', 'Output script')
  .action(convert);

program.parse();
