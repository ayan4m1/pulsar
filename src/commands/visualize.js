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

  graphData.push({ label: `${currentTime + 1}s`, value: 0 });

  const maxWidth = 120;
  const chartWidth = Math.min(maxWidth, Math.max(0, currentTime + 1));
  const barSize = Math.ceil(chartWidth / 6);

  const chart = new Chartscii(graphData, {
    fill: '░',
    padding: 0,
    naked: true,
    color: 'green',
    theme: 'pastel',
    barSize: barSize,
    width: chartWidth,
    orientation: 'vertical'
  });

  const borderString = Array(chartWidth - 1)
    .fill('━')
    .join('');

  console.log(borderString);
  console.log(chart.create());
  console.log(borderString);
} catch (error) {
  console.error(error);
  process.exit(1);
}
