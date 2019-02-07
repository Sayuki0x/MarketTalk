const discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const request = require('request-promise');

// DATA CODE

// format numbers with commas like currency

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const Globals = {
    ogreLTCInfo: undefined,
    ogreBTCInfo: undefined,
    geckoInfo: undefined,
    pricePerMillion: undefined,
    litPrice: undefined,
    satPrice: undefined,
    networkInfo: undefined,
    avgTx: undefined,
    netHash: undefined,
    totalNodes: undefined,
};

async function update() {
    Globals.ogreLTCInfo = await getOgreLTCInfo();
    Globals.ogreBTCInfo = await getOgreBTCInfo();
    Globals.geckoInfo = await getGeckoInfo();
    Globals.networkInfo = await getNetworkInfo();
    Globals.totalNodes = await getTotalNodes();
    Globals.pricePerMillion =  Globals.geckoInfo.current_price * 1000000;
    Globals.litPrice = Math.round(Globals.ogreLTCInfo.price * 100000000);
    Globals.satPrice = Math.round(Globals.ogreBTCInfo.price * 100000000);
    Globals.avgTx = Globals.networkInfo.tx_count / Globals.networkInfo.height;
    Globals.netHash = Globals.networkInfo.hashrate / 1000000
}

async function init() {
    await update();

    setInterval(update, 5000);
}

// BOT CODE

// Configure logger settings

logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot

(async () => {
    await init();
})()

const bot = new discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', (user, userID, channelID, message, evt) => {

    // It will listen for messages that will start with `!`
    if (message[0] === '!') {
        const [cmd, args] = message.substring(1).split(' ');

        if (cmd === 'price') {
            bot.sendMessage({
                to: channelID,
                message: `## **TurtleCoin Market Info** ##\n\n` +
                         `Rank: **${Globals.geckoInfo.market_cap_rank}**\n\n` +
                         `Price LTC: **${Globals.litPrice.toFixed(0)} litoshi**\n` +
                         `Price BTC: **${Globals.satPrice.toFixed(0)} satoshi**\n` +
                         `Price USD Per Million: **$${Globals.pricePerMillion.toFixed(2)}**\n\n` +
                         `24h Change: **${Globals.geckoInfo.price_change_percentage_24h.toFixed(2)}%**\n` +
                         `24h Volume: **$${numberWithCommas(Globals.geckoInfo.total_volume.toFixed(2))}**\n` +
                         `Market Cap: **$${numberWithCommas(Globals.geckoInfo.market_cap.toFixed(2))}**\n` +
                         `Current Supply: **${numberWithCommas(Globals.geckoInfo.circulating_supply)} TRTL**`
            });
        }

		if (cmd === 'network') {
            bot.sendMessage({
                to: channelID,
                message: `## **TurtleCoin Network Info** ##\n\n` +
                         `Network Hashrate: **${Globals.netHash.toFixed(2)} MH/s**\n` +
                         `Difficulty: **${numberWithCommas(Globals.networkInfo.difficulty)}**\n` +
                         `Current Height: **${numberWithCommas(Globals.networkInfo.height)}**\n` +
                         `Avg Tx per Block: **${Globals.avgTx.toFixed(2)}**\n` +
                         `Total Nodes: **${numberWithCommas(Globals.totalNodes)}**`
            });
        }

    }
});

// get LTC Info from TradeOgre

async function getOgreLTCInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://tradeogre.com/api/v1/ticker/LTC-TRTL',
        headers: {},
        json: true,
        gzip: true
    };
 
    try {
        const result = await request(requestOptions);
        console.log(result);
        return result;
    } catch (err) {
        console.log('Request failed, TradeOgre API call error:', err);
        return undefined;
    }
}

// get BTC Info from TradeOgre

async function getOgreBTCInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://tradeogre.com/api/v1/ticker/BTC-TRTL',
        headers: {},
        json: true,
        gzip: true
    };

    try {
        const result = await request(requestOptions);
        console.log(result);
        return result;
    } catch (err) {
        console.log('Request failed, TradeOgre API call error:', err);
        return undefined;
    }
}

// get TRTL Info from CoinGecko

async function getGeckoInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 
'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false',
        headers: {},
        json: true,
        gzip: true
    };

    try {
        const result = await request(requestOptions);
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log('Request failed, CoinGecko API call error:', err);
        return undefined;
    }
}

// get TRTL Network Info from HashVault node

async function getNetworkInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 
'http://nodes.hashvault.pro:11898/getinfo',
        headers: {},
        json: true,
        gzip: true
    };

    try {
        const result = await request(requestOptions);
        console.log(result);
        return result;
    } catch (err) {
        console.log('Request failed, HashVault Node API call error:', err);
        return undefined;
    }
}

// get TRTL Network Info from ShellMaps

async function getTotalNodes() {
    const requestOptions = {
        method: 'GET',
        uri:
'https://shellmap.mine2gether.com/api/stats',
        headers: {},
        json: true,
        gzip: true
    };

    try {
        const result = await request(requestOptions);
        console.log(`Shellmaps Total Node Count: ${result.globalData.nodeCount}`);
        return result.globalData.nodeCount;
    } catch (err) {
        console.log('Request failed, ShellMaps API call error:', err);
        return undefined;
    }
}
