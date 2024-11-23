import { write } from "../../utilities/db-connection.js";


export const insertSettlement = async(data)=> {
    try{
        const { betId, multiplier, winAmount} = data;
        const [initial, matchId, operatorId, userId, betAmount, pins, section] = betId.split(':');
        const decodeUserId = decodeURIComponent(userId);
        await write(`INSERT INTO settlement (bet_id, lobby_id, pins, section, user_id, operator_id, bet_amount, max_mult, win_amount) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [betId, matchId, Number(pins), section, decodeUserId, operatorId, parseFloat(betAmount), multiplier, winAmount]);
        console.log(`Settlement data inserted successfully`);
    }catch(err){
        console.error(`Err while inserting data in table is:::`, err);
    }
}