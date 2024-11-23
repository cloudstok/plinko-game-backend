import { appConfig } from "../utilities/app-config.js";
import { generateUUIDv7 } from "../utilities/common-function.js";
import { getCache, deleteCache, setCache } from "../utilities/redis-connection.js";
import { createLogger } from "../utilities/logger.js";
import { PinsData } from "../utilities/helper-function.js";
import { getResult } from "../module/bets/bet-session.js";
const gameLogger = createLogger('Game', 'jsonl');
const betLogger = createLogger('Bets', 'jsonl');
const cashoutLogger = createLogger('Cashout', 'jsonl');
const cachedGameLogger = createLogger('cachedGame', 'jsonl');


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
    if(Number(playerDetails.balance) < betAmount) return logEventAndEmitResponse(gameLog, 'Insufficient Balance', 'game', socket);
    if((betAmount < appConfig.minBetAmount) || (betAmount > appConfig.maxBetAmount)) return logEventAndEmitResponse(gameLog, 'Invalid Bet', 'game', socket);
    const matchId = generateUUIDv7();
    const result = await getResult(matchId, betAmount, pins, color, playerDetails, socket);
    socket.emit('result', result);
};

export const disconnect = async(socket) => {
    await deleteCache(`PL:${socket.id}`);
    console.log("User disconnected:", socket.id);
};

export const reconnect = async(socket) => {
    const cachedPlayerDetails = await getCache(`PL:${socket.id}`);
    if(!cachedPlayerDetails) return socket.disconnect(true);
    const playerDetails = JSON.parse(cachedPlayerDetails);
    const cachedGame = await getCache(`GM:${playerDetails.id}`);
    if(!cachedGame) return;
    const game = JSON.parse(cachedGame); 
    cachedGameLogger.info(JSON.stringify({ logId: generateUUIDv7(), playerDetails, game }))
    socket.emit("game_status", { 
        matchId: game.matchId,
        bank: game.bank,
        revealedCells: game.revealedCells,
        multiplier: game.multiplier
    });
}
