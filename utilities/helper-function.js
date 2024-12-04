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

  const multipliers = defaultData[pins][color];
  const exps = multipliers.slice(multipliers.length / 2, multipliers.length);
  const finalData = getMultFromRandomVal(exps, Math.random());
  const finalIndex = finalData.direction == 'L' ? multipliers.indexOf(finalData.val) : multipliers.lastIndexOf(finalData.val);
  return {  multiplier: finalData.val, index: finalIndex };
}

const getMultFromRandomVal = (exps, val) => {
  const exp = exps.sort((a, b) => a - b);
  const sum = exp.reduce((acc, num) => acc + num, 0);
  const perc = exp.map(e => e != 0 ? sum / e : 0);
  const perSum = perc.reduce((acc, num) => acc + num, 0);
  const revPer = perc.map(e => e / perSum);

  const direction = Math.random() > 0.5 ? 'L' : 'R';
  let per = revPer[0];
  let index = 0;
  while (val > per) {
    ++index;
    per = per + revPer[index];
  }
  if (val)
    return { val: exp[index], direction }
}