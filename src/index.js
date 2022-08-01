import { Command } from 'commander';
import { readFileSync } from 'fs';
import Papa from 'papaparse';
import { resolve } from 'path';
import { SerialPort } from 'serialport';

import { getLogger } from './modules/logging.js';

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const log = getLogger('app');
const program = new Command();

program
  .name('pulsar')
  .version('0.1.0')
  .description('Scripted DNA control')
  .argument('<path>', 'CSV script')
  .requiredOption('-p, --port <value>', 'Serial port');

program.parse();

const { port } = program.opts();
const [path] = program.args;

if (!path) {
  log.error('Required argument missing!');
  process.exit(0);
}

log.info('Reading script...');
const { data } = Papa.parse(readFileSync(resolve(path), 'utf-8'));

log.info(`Read ${data.length} rows`);

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
    const [action, rawTime] = row;
    const time = parseInt(rawTime, 10);

    switch (action) {
      case 'F':
        log.info(`Firing for ${time} seconds...`);
        serialPort.write(`F=${time}S\n`);
        await delay(time * 1000);
        break;
      case 'P':
        log.info(`Pausing for ${time} seconds...`);
        await delay(time * 1000);
        break;
    }
  }

  log.info('Finished script!');
  serialPort.close();
});
