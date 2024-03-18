import Papa from 'papaparse';
import { resolve } from 'path';
import { program } from 'commander';
import { readFile } from 'fs/promises';
import { SerialPort } from 'serialport';

import { getLogger } from '../modules/logging.js';

const log = getLogger('run');

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

program
  .argument('<path>', 'CSV script')
  .requiredOption(
    '-p, --port <value>',
    'Serial port (e.g. "COM3" or /dev/ttyUSB0)'
  )
  .parse();

try {
  const [path] = program.args;
  const { port } = program.opts();

  if (!path) {
    log.error('Required argument missing!');
    process.exit(1);
  }

  log.info('Reading puff data...');
  const { data } = Papa.parse(await readFile(resolve(path), 'utf-8'), {
    comments: '#',
    skipEmptyLines: true
  });

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

    for (const [action, rawValue] of data) {
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
} catch (error) {
  console.error(error);
  process.exit(1);
}
