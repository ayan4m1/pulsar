import Papa from 'papaparse';
import { existsSync } from 'fs';
import Chartscii from 'chartscii';
import { program } from 'commander';

import { getLogger } from '../modules/logging.js';
import { readFile } from 'fs/promises';

const log = getLogger('visualize');

program.argument('<input>', '.puff file to visualize').parse();

try {
  const [inputPath] = program.args;

  if (!existsSync(inputPath)) {
    throw new Error(`${inputPath} does not exist!`);
  }

  log.info(`Opening ${inputPath}...`);

  const { data } = Papa.parse(await readFile(inputPath, 'utf-8'), {
    comments: '#',
    skipEmptyLines: true
  });

  let currentTime = 0;
  const graphData = [];
  for (const [action, rawValue] of data) {
    const value = parseFloat(rawValue);

    switch (action) {
      case 'F':
      case 'P':
        currentTime += value;
        break;
      case 'W':
        graphData.push({ label: `${currentTime}s`, value });
        break;
    }
  }

  const chart = new Chartscii(graphData, { color: 'green', reverse: true });

  console.log(chart.create());
} catch (error) {
  console.error(error);
  process.exit(1);
}
