import { variableConfig } from "./load-config.js";
import { createLogger } from "./logger.js";
const failedBetLogger = createLogger('failedBets', 'jsonl');

export const logEventAndEmitResponse = (req, res, event, socket) => {
  let logData = JSON.stringify({ req, res })
  if (event === 'bet') {
    failedBetLogger.error(logData)
  }
  return socket.emit('betError', res);
}


const defaultData = {
  12: {
    Green: [11, 3.2, 1.6, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.6, 3.2, 11],
    Yellow: [25, 8, 3.1, 1.7, 1.2, 0.7, 0.3, 0.7, 1.2, 1.7, 3.1, 8, 25],
    Red: [141, 25, 8.1, 2.3, 0.7, 0.2, 0, 0.2, 0.7, 2.3, 8.1, 25, 141],
  },
  14: {
    Green: [18, 3.2, 1.6, 1.3, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.3, 1.6, 3.2, 18],
    Yellow: [55, 12, 5.6, 3.2, 1.6, 1, 0.7, 0.2, 0.7, 1, 1.6, 3.2, 5.6, 12, 55],
    Red: [353, 49, 14, 5.3, 2.1, 0.5, 0.2, 0, 0.2, 0.5, 2.1, 5.3, 14, 49, 353],
  },
  16: {
    Green: [35, 7.7, 2.5, 1.6, 1.3, 1.2, 1.1, 1, 0.4, 1, 1.1, 1.2, 1.3, 1.6, 2.5, 7.7, 35],
    Yellow: [118, 61, 12, 4.5, 2.3, 1.2, 1, 0.7, 0.2, 0.7, 1, 1.2, 2.3, 4.5, 12, 61, 118],
    Red: [555, 122, 26, 8.5, 3.5, 2, 0.5, 0.2, 0, 0.2, 0.5, 2, 3.5, 8.5, 26, 122, 555],
  }
}

export const PinsData = () => {
  return variableConfig.multiplierValues || defaultData;
};

export const getRandomMultiplier = (pins, color) => {
  const defaultData = PinsData();

  if (!defaultData[pins] || !defaultData[pins][color]) {
    throw new Error("Invalid pins or color selection.");
  }

  const index = getPlinkoOdds(pins);
  const multiplier = defaultData[pins][color][index];
  return { multiplier, index };
}

const pascals = (curRows) => {
  const numRows = Number(curRows) + 2;
  if (numRows === 0) return [];
  if (numRows === 1) return [[1]];
  let result = [];
  for (let row = 1; row <= numRows; row++) {
    let arr = [];
    for (let col = 0; col < row; col++) {
      if (col === 0 || col === row - 1) {
        arr.push(1);
      } else {
        arr.push((result[row - 2][col - 1] + result[row - 2][col]));
      }
    }
    result.push(arr);
  }
  const sum = 2 ** (numRows - 1);
  const lastRow = result[numRows - 1];
  lastRow.splice(numRows / 2, 1);
  lastRow[numRows / 2 - 1] *= 2;
  return { number: curRows, sum, lastRow };
};

const getPlinkoOdds = (pins) => {
  const pascalsArr = Object.keys(PinsData()).map(pascals);
  const curMap = pascalsArr.find(e => e.number == pins);
  const random = Math.floor(Math.random() * curMap.sum) + 1;
  let per = curMap.lastRow[0];
  let index = 0;
  while (per < random) {
    ++index;
    per += curMap.lastRow[index];
  }
  return index
};
