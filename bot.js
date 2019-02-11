//requires
const discord = require('discord.io');
const request = require('request-promise');
const auth = require('./auth.json');

// format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// global variable list
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
    gainsEmoji: undefined,
};

// async block
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
	  if (Globals.geckoInfo.price_change_percentage_24h > 0) {
		Globals.gainsEmoji = `📈`;
   	}
	  else {
		Globals.gainsEmoji = `📉`;
  	}
}

// refreshes variables every 5s
async function init() {
    await update();
    setInterval(update, 5000);
}

// Initialize Discord Bot
(async () => {
    await init();
})()

const bot = new discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', (evt) => {
    console.log(`** Connected, logged in as ${bot.username}-${bot.id} and listening for commands.`);
});

bot.on('error', console.error);

bot.on('message', (user, userID, channelID, message, evt) => {

    // It will listen for messages that will start with `!`
    if (message[0] === '!') {
        const [cmd, args] = message.substring(1).split(' ');

        if (cmd === 'price') {
            bot.sendMessage({
                to: channelID,
                /* message:    
				    `🐢 **TurtleCoin Market Info** 🐢\n\n` +
                    `Rank: **${Globals.geckoInfo.market_cap_rank}**\n\n` +
                    `Price LTC: **${Globals.litPrice.toFixed(0)} litoshi**\n` +
                    `Price BTC: **${Globals.satPrice.toFixed(0)} satoshi**\n` +
                    `Price USD Per Million: **$${Globals.pricePerMillion.toFixed(2)}**\n\n` +
                    `24h Change: **${Globals.geckoInfo.price_change_percentage_24h.toFixed(2)}%** ${Globals.gainsEmoji}\n` +
                    `24h Volume: **$${numberWithCommas(Globals.geckoInfo.total_volume.toFixed(2))}**\n` +
                    `Market Cap: **$${numberWithCommas(Globals.geckoInfo.market_cap.toFixed(2))}**\n` +
                    `Current Supply: **${numberWithCommas(Globals.geckoInfo.circulating_supply)} TRTL**`, */
		        embed: {
					title: `🐢🐢 TurtleCoin MarketTalk Price Info 🐢🐢`,
					color: 3066993,
				    thumbnail:
					{
						url: 'https://raw.githubusercontent.com/turtlecoin/turtlecoin.lol/master/images/favicons/apple-touch-icon-120x120.png',
					},
					fields: 
					[{
                        name: "Rank",
                        value: `${Globals.geckoInfo.market_cap_rank}`
                    },
                    {
                        name: "Price",
                        value: `TRTL/LTC: **${Globals.litPrice.toFixed(0)} litoshi**\n` +
                               `TRTL/BTC: **${Globals.satPrice.toFixed(0)} satoshi**\n` +
                               `USD Per Million: **$${Globals.pricePerMillion.toFixed(2)}**\n\n`
                    },
                    {
                    name: "Movement",
                    value: `24h Change: **${Globals.geckoInfo.price_change_percentage_24h.toFixed(2)}%** ${Globals.gainsEmoji}\n` +
                           `24h Volume: **$${numberWithCommas(Globals.geckoInfo.total_volume.toFixed(2))}**\n` +
                           `Market Cap: **$${numberWithCommas(Globals.geckoInfo.market_cap.toFixed(2))}**\n` +
                           `Current Supply: **${numberWithCommas(Globals.geckoInfo.circulating_supply)} TRTL**`
                    }],
					footer: 
					{
						text: 'MarketTalk © 2019 ExtraHash'
					}
				}
            });
        }
		
        if (cmd === 'embed') {
            bot.sendMessage({
                to: channelID,
                message:    `🐢 **TurtleCoin Network Info** 🐢\n\n` +
                            `Network Hashrate: **${Globals.netHash.toFixed(2)} MH/s**\n` +
                            `Current Height: **${numberWithCommas(Globals.networkInfo.height)}**\n\n` +
                            `Avg TX/Block: **${Globals.avgTx.toFixed(2)}**\n` +
						    `TX in Mempool: **${numberWithCommas(Globals.networkInfo.tx_pool_size)}**\n` +
                            `Total Nodes: **${numberWithCommas(Globals.totalNodes)}**`
            });
        }

		if (cmd === 'network') {
            bot.sendMessage({
                to: channelID,
                message:    `🐢 **TurtleCoin Network Info** 🐢\n\n` +
                            `Network Hashrate: **${Globals.netHash.toFixed(2)} MH/s**\n` +
                            `Current Height: **${numberWithCommas(Globals.networkInfo.height)}**\n\n` +
                            `Avg TX/Block: **${Globals.avgTx.toFixed(2)}**\n` +
						    `TX in Mempool: **${numberWithCommas(Globals.networkInfo.tx_pool_size)}**\n` +
                            `Total Nodes: **${numberWithCommas(Globals.totalNodes)}**`
            });
        }

		if (cmd === 'help') {
            bot.sendMessage({
                to: channelID,
                message:    `🐢 **MarketTalk Commands:** 🐢\n` +
                            `\`\`\`!help : Displays this menu.\n` +
						    `!price : Displays price information.\n` +
                            `!network : Displays network information.\`\`\``
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
        //console.log(result);
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
        //console.log(result);
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
        //console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log('Request failed, CoinGecko trtl API call error:', err);
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
        //console.log(result);
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
        //console.log(`Shellmaps Total Node Count: ${result.globalData.nodeCount}`);
        return result.globalData.nodeCount;
    } catch (err) {
        console.log('Request failed, ShellMaps API call error:', err);
        return undefined;
    }
}
