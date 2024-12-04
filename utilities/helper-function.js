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
  
    const weights = multipliers.map((value) => (value > 0 ? 1 / value : 0));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
    const probabilities = weights.map((weight) => weight / totalWeight);
  
    const random = Math.random();
    let cumulativeProbability = 0;
  
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (random < cumulativeProbability) {
        return { multiplier: multipliers[i], index: i };
      }
    }
}