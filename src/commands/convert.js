import Papa from 'papaparse';
import { resolve } from 'path';
import { program } from 'commander';
import { readFile, writeFile } from 'fs/promises';

import { getLogger } from '../modules/logging.js';

const log = getLogger('convert');

const Columns = {
  TIME: 'Time',
  CURRENT: 'Current',
  POWER: 'Power Setpoint'
};

program
  .argument('<input>', 'Input .csv file from EScribe (Record Puff)')
  .argument('<output>', 'Output .puff file')
  .parse();

try {
  const [input, output] = program.args;

  if (!input || !output) {
    log.error('Required arguments missing!');
    process.exit(1);
  }

  log.info('Reading CSV...');
  const { data } = Papa.parse(await readFile(resolve(input), 'utf-8'), {
    header: true,
    skipEmptyLines: true
  });

  log.info(`Read ${data.length} rows`);

  let lastEndTime = 0,
    lastTime = 0,
    lastCurrent = 0,
    lastPower = 0;
  const commands = [];

  for (const row of data) {
    const [rawTime, rawCurrent, rawPower] = [
      row[Columns.TIME],
      row[Columns.CURRENT],
      row[Columns.POWER]
    ];

    const time = parseFloat(rawTime);
    const current = parseFloat(rawCurrent || '0');
    const power = parseFloat(rawPower || '0');

    if (lastPower !== power) {
      commands.push(`W,${power}`);
    }

    if (!lastCurrent && current > 0) {
      lastTime = time;
    } else if (lastCurrent && !current) {
      const startTime = time - lastEndTime;
      const duration = time - lastTime;

      commands.push(`P,${Math.round((startTime - duration) * 1000) / 1000}`);
      commands.push(`F,${Math.round(duration * 1000) / 1000}`);

      lastEndTime = time;
    }

    lastPower = power;
    lastCurrent = current;
  }

  await writeFile(output, commands.join('\n'));
  log.info(`Wrote ${commands.length} commands to ${output}!`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
