import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';
import { resolve } from 'path';

import { getLogger } from '../modules/logging.js';

const log = getLogger('convert');

const Columns = {
  TIME: 'Time',
  CURRENT: 'Current',
  POWER: 'Power Setpoint'
};

export default function (input, output) {
  if (!input || !output) {
    log.error('Required arguments missing!');
    process.exit(1);
  }

  log.info('Reading CSV...');
  const { data } = Papa.parse(readFileSync(resolve(input), 'utf-8'), {
    header: true,
    skipEmptyLines: true
  });

  log.info(`Read ${data.length} rows`);

  let lastEndTime = 0;
  let lastTime = 0;
  let lastCurrent = 0;
  let lastPower = 0;
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

  writeFileSync(output, commands.join('\n'));
  log.info(`Wrote ${commands.length} commands to ${output}!`);
}
