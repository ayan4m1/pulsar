import Papa from 'papaparse';
import winston from 'winston';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const { Container, format, transports } = winston;
const { combine, label, prettyPrint, printf } = format;

const loggers = {};
const container = new Container();

const createLogger = (category, categoryLabel) => {
  let formatter = (data) => `[${data.level}][${data.label}] ${data.message}`;
  const formatters = [label({ label: categoryLabel })];

  formatters.push(prettyPrint(), printf(formatter));
  container.add(category, {
    transports: [
      new transports.Console({
        level: 'info',
        format: combine.apply(null, formatters)
      })
    ]
  });

  return container.get(category);
};

export const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const readText = (path) => readFile(resolve(path), 'utf-8');

export const parseCsv = async (path, header = false) => {
  if (!existsSync(path)) {
    throw new Error(`${path} does not exist!`);
  }

  const text = await readText(path);
  const { data } = Papa.parse(text, {
    header,
    comments: '#',
    skipEmptyLines: true
  });

  return data;
};

export const validatePuff = async (path) => {
  const data = await parseCsv(path);

  if (!Array.isArray(data)) {
    throw new Error('Input is not an array!');
  }

  let i = 0;

  for (const [action, rawValue] of data) {
    const value = parseFloat(rawValue);

    switch (action) {
      case 'W':
        if (value < 0 || value > 75) {
          throw new Error(
            `Line ${i}: Wattage setting ${value} is outside the range 0-75 watts!`
          );
        }
        break;
      case 'F':
        if (value < 0 || value > 30) {
          throw new Error(
            `Line ${i}: Fire time ${value} is outside the range 0-30 seconds!`
          );
        }
        break;
      case 'P':
        if (value < 0 || value > 86400) {
          throw new Error(
            `Line ${i}: Pause duration ${value} is outside the range 0-86400 seconds!`
          );
        }
        break;
      default:
        throw new Error(`Line ${i}: Invalid action code!`);
    }

    i++;
  }
};

export const getLogger = (category, categoryLabel = category) => {
  if (!loggers[category]) {
    loggers[category] = createLogger(category, categoryLabel);
  }

  return loggers[category];
};
