import { SerialPort } from 'serialport';

import { getLogger } from './modules/logging.js';

const log = getLogger('app');

const execute = async () => {
  log.info('Connecting...');
  const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600
  });

  port.on('open', (err) => {
    if (err) {
      log.error(err);
      return;
    }

    port.write('F=1S\n');
    log.info('Wrote fire command!');
  });
  port.on('data', (data) => {
    console.dir(data);
  });
};

execute();
