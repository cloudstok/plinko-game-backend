import { read } from "./db-connection.js";

export const variableConfig = {
    multiplierValues : {},
}

export const loadConfig = async () => {
    const configData = await read(`SELECT * FROM config_master where is_active = 1`);
    configData.forEach(data=> {
        if(data.data_key == 'multiplier_values'){
            variableConfig.multiplierValues = data.value;
        }
    })
    console.log("DB Variables loaded in cache");
};

