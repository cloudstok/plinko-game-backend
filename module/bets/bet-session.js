import { appConfig } from "../../utilities/app-config.js";
import { updateBalanceFromAccount } from "../../utilities/common-function.js";
import { getRandomMultiplier, PinsData } from "../../utilities/helper-function.js";
import { getCache, setCache } from "../../utilities/redis-connection.js";
import { insertSettlement } from "./bet-db.js";

export const getResult = async(matchId, betAmount, pins, section, playerDetails, socket)=> {
    const userIP = socket.handshake.headers?.['x-forwarded-for']?.split(',')[0].trim() || socket.handshake.address;
    const playerId = playerDetails.id.split(':')[1];

    const updateBalanceData = {
        id: matchId,
        bet_amount: betAmount,
        socket_id: playerDetails.socketId,
        user_id: playerId,
        ip: userIP
    };

    const transaction = await updateBalanceFromAccount(updateBalanceData, "DEBIT", playerDetails);
    if (!transaction) return { error: 'Bet Cancelled by Upstream' };
    playerDetails.balance = (playerDetails.balance - betAmount).toFixed(2);
    socket.emit('info', { user_id: playerDetails.userId, operator_id: playerDetails.operatorId, balance: playerDetails.balance });
    const bet_id = `BT:${matchId}:${playerDetails.operatorId}:${playerDetails.userId}:${betAmount}:${pins}:${section}`;
    const multiplierData = getRandomMultiplier(pins, section);
    const winningMultiplierIndex = multiplierData.index;
    const winningMultiplier = multiplierData.multiplier;
    const winAmount = Math.min((Number(betAmount) * winningMultiplier), Number(appConfig.maxCashoutAmount)).toFixed(2);
    setTimeout(async()=> {
        if(Number(winAmount) > 0){
            const updateBalanceData = {
                id: matchId,
                winning_amount: winAmount,
                socket_id: playerDetails.socketId,
                txn_id: transaction.txn_id,
                user_id: playerDetails.id.split(':')[1],
                ip: userIP
            };
            const isTransactionSuccessful = await updateBalanceFromAccount(updateBalanceData, "CREDIT", playerDetails);
            if (!isTransactionSuccessful) console.error(`Credit failed for user: ${playerDetails.userId} for round ${matchId}`);
            const creditPlayerDetails = await getCache(`PL:${playerDetails.socketId}`);
            if(creditPlayerDetails){
                const parseduserDetails = JSON.parse(creditPlayerDetails);
                socket.emit('info', { user_id: parseduserDetails.userId, operator_id: parseduserDetails.operatorId, balance: parseduserDetails.balance });
            }
        }
        //Insert Into Settlement
        await insertSettlement({
            betId: bet_id,
            multiplier: winningMultiplier,
            winAmount: winAmount
        });
    }, 6500);
    playerDetails.balance = (Number(playerDetails.balance) + Number(winAmount)).toFixed(2);
    await setCache(`PL:${playerDetails.socketId}`, JSON.stringify(playerDetails));
    return { winningMultiplier, index: winningMultiplierIndex, color: section, payout: winAmount };
}