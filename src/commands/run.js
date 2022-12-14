import { readFileSync } from 'fs';
import Papa from 'papaparse';
import { resolve } from 'path';
import { SerialPort } from 'serialport';

import { getLogger } from '../modules/logging.js';

const log = getLogger('run');

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default function (path, { port }) {
  if (!path) {
    log.error('Required argument missing!');
    process.exit(1);
  }

  log.info('Reading script...');
  const { data } = Papa.parse(readFileSync(resolve(path), 'utf-8'));

  log.info(`Read ${data.length} rows`);

  for (const [action, rawValue] of data) {
    const value = parseFloat(rawValue);

    if (action === 'F' && value > 30) {
      log.error(`Fire time ${value} exceeds limit!`);
      process.exit(1);
    }
  }

  log.info('Connecting to device...');
  const serialPort = new SerialPort({
    path: port,
    baudRate: 9600
  });

  serialPort.on('open', async (err) => {
    if (err) {
      log.error(err);
      return;
    }

    log.info('Opened serial port!');

    for (const row of data) {
      const [action, rawValue] = row;
      const value = parseFloat(rawValue);

      switch (action) {
        case 'F':
          log.info(`Firing for ${value} seconds...`);
          serialPort.write(`F=${value}S\n`);
          await delay(value * 1000);
          break;
        case 'P':
          log.info(`Pausing for ${value} seconds...`);
          await delay(value * 1000);
          break;
        case 'W':
          log.info(`Setting wattage to ${value}...`);
          serialPort.write(`P=${value}W\n`);
          break;
      }
    }

    log.info('Finished script!');
    serialPort.close();
  });
}
