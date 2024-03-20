import { existsSync } from 'fs';
import Chartscii from 'chartscii';
import { program } from 'commander';

import { parseCsv, getLogger } from '../utils/index.js';

const log = getLogger('visualize');

program.argument('<input>', '.puff file to visualize').parse();

try {
  const [path] = program.args;

  if (!existsSync(path)) {
    throw new Error(`${path} does not exist!`);
  }

  log.info(`Reading CSV...`);
  const data = await parseCsv(path);

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
