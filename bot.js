var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const request = require('request-promise');

// DATA CODE

// format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

(async () => {

    var ogreLTCInfo = await getogreLTCInfo();
    var ogreBTCInfo = await getogreBTCInfo();
    var geckoInfo = await getgeckoInfo();
    var pricePerMillion =  geckoInfo.current_price*1000000
    var litPrice = Math.round(ogreLTCInfo.price*100000000)
    var satPrice = Math.round(ogreBTCInfo.price*100000000)
// BOT CODE

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !price
            case 'price':
                bot.sendMessage({
                    to: channelID,
                    message: `## **TurtleCoin Market Info** ##\n` +
                             `**Rank:** ${geckoInfo.market_cap_rank}\n\n` +
                             `**Price LTC:** ${litPrice.toFixed(0)} litoshi\n` +
                             `**Price BTC:** ${satPrice.toFixed(0)} satoshi\n` +
                             `**Price USD Per Million:** $${pricePerMillion.toFixed(2)}\n\n` +
                             `**24h Change:** ${geckoInfo.price_change_percentage_24h.toFixed(2)}%\n` +
                             `**24h Volume:** $${numberWithCommas(geckoInfo.total_volume.toFixed(2))}\n` +
                             `**Market Cap:** $${numberWithCommas(geckoInfo.market_cap.toFixed(2))}\n` +
                             `**Current Supply:** ${numberWithCommas(geckoInfo.circulating_supply)} TRTL`
                });
            break;
            // add case commands here
         }
     }
});


})().catch(err => {
    console.log('Async function failed:', err);
});

async function getogreLTCInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://tradeogre.com/api/v1/ticker/LTC-TRTL',
        headers: {},
        json: true,
        gzip: true
    };
 

    try {
        const result = await request(requestOptions);
        return result;
    } catch (err) {
        console.log('Request failed, TradeOgre API call error:', err);
        return undefined;
    }
}

async function getogreBTCInfo() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://tradeogre.com/api/v1/ticker/BTC-TRTL',
        headers: {},
        json: true,
        gzip: true
    };


    try {
        const result = await request(requestOptions);
        return result;
    } catch (err) {
        console.log('Request failed, TradeOgre API call error:', err);
        return undefined;
    }
}


async function getgeckoInfo() {
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
        return result[0];
    } catch (err) {
        console.log('Request failed, CoinGecko API call error:', err);
        return undefined;
    }
}
