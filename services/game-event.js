import { appConfig } from "../utilities/app-config.js";
import { generateUUIDv7 } from "../utilities/common-function.js";
import { getCache, deleteCache } from "../utilities/redis-connection.js";
import { createLogger } from "../utilities/logger.js";
import { logEventAndEmitResponse, PinsData } from "../utilities/helper-function.js";
import { getResult } from "../module/bets/bet-session.js";
const betLogger = createLogger('Bets', 'jsonl');


export const emitValuesMultiplier = (socket)=> {
    socket.emit('multiplier_values', JSON.stringify(PinsData()));
} 

export const placeBet = async(socket, betData) => {
    const betAmount = Number(betData[0]) || null;
    const pins = Number(betData[1]) || null;
    const color = betData[2];
    if(!betAmount || !pins || !color) return socket.emit('betError', 'Bet Amount, Pins and Color is missing in request');
    const cachedPlayerDetails = await getCache(`PL:${socket.id}`);
    if(!cachedPlayerDetails) return socket.emit('betError', 'Invalid Player Details');
    const playerDetails = JSON.parse(cachedPlayerDetails);
    const gameLog = { logId: generateUUIDv7(), player: playerDetails, betData};
    if(Number(playerDetails.balance) < betAmount) return logEventAndEmitResponse(gameLog, 'Insufficient Balance', 'bet', socket);
    if((betAmount < appConfig.minBetAmount) || (betAmount > appConfig.maxBetAmount)) return logEventAndEmitResponse(gameLog, 'Invalid Bet', 'bet', socket);
    const matchId = generateUUIDv7();
    const result = await getResult(matchId, betAmount, pins, color, playerDetails, socket);
    betLogger.info(JSON.stringify({ ...gameLog, result }))
    socket.emit('result', result);
};

export const disconnect = async(socket) => {
    await deleteCache(`PL:${socket.id}`);
    console.log("User disconnected:", socket.id);
};

