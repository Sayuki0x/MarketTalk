// requires
const discord = require('discord.io');
const config = require('./config.json')
const Data = require('./data.js');
const Constants = require('./constants.js');

const data = new PriceData();
const bot = new discord.Client({
    token: config.authtoken,
    autorun: true
});

data.init();

// reconnect if disconected
bot.on('disconnect', function() {
    console.log("** Bot disconnected, reconnecting...");
    bot.connect(); //Auto reconnect
});

// error logging
bot.on('error', console.error);

// on message handling
bot.on('message', (user, userID, channelID, message, evt) => {

    // listen for messages that will start with `!`
    if (message[0] === '!') {
        const [cmd, args] = message.substring(1).split(' ');
        const echo = message.substring(6);
        switch (cmd) {
            case 'difficulty': {
                handleDifficulty(channelID, evt, userID, args);
                break;
            }
            case 'echo': {
                handleEcho(channelID, evt, userID, echo);
                break;
            }
            case 'hashrate': {
                handleHashrate(channelID, evt, userID, args);
                break;
            }
            case 'height': {
                handleHeight(channelID, evt, userID, args);
                break;
            }
            case 'help': {
                handleHelp(channelID, evt, userID, args);
                break;
            }
            case 'lambo':
            case 'viper': {
                handleCar(channelID, evt, userID, args, cmd);
                break;
            }
            case 'mcap': {
                handleMcap(channelID, evt, userID, args);
                break;
            }
            case 'network': {
                handleNetwork(channelID, evt, userID, args);
                break;
            }
            case 'price': {
                handlePrice(channelID, evt, userID, args);
                break;
            }
            case 'supply': {
                handleSupply(channelID, evt, userID, args);
                break;
            }
        }
    }
});

// on log in
bot.on('ready', (evt) => {
    console.log(`** Connected, logged in as ${bot.username}-${bot.id} and listening for commands.`);
});

// message handling
function handleDifficulty(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.networkInfo.difficulty, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Current difficulty message sent');
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `The current difficulty is **${numberWithCommas(data.networkInfo.difficulty)}**`
        });
    }
}

function handleHashrate(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.networkInfo.difficulty, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Current hashrate message sent');
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `The current global hashrate is **${((data.networkInfo.difficulty / 30) / 1000000).toFixed(2)} MH/s**`
        });
    }
}

function handleHeight(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.networkInfo.height, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Current block height message sent');
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `The current  block height is **${numberWithCommas(data.networkInfo.height)}**`
        });
    }
}

function handleHelp(channelID, evt, userID, args) {
    console.log('** Help menu message sent');
    botReact(channelID, evt, '☑');
    bot.sendMessage({
        to: channelID,
        message: '\`\`\`!difficulty   :   Displays current difficulty.\n' +
            '!hashrate     :   Displays current network hashrate.\n' +
            '!height       :   Displays current block height.\n' +
            '!help         :   Displays this menu.\n' +
            '!mcap         :   Displays current market capitilization.\n' +
            '!lambo        :   Displays current price of new lambo.\n' +
            '!network      :   Displays network information.\n' +
            '!price        :   Displays price information.\n' +
            '!supply       :   Displays current network hashrate.\n' +
            '!viper        :   Displays current price of a new viper.\`\`\`'
    });
}

function handleCar(channelID, evt, userID, args, cmd) {
    let carInfo = [];
    if (!checkDataAvailable(data.geckoInfo.current_price, channelID, evt) === undefined) {
        return;
    } else {
        if (cmd === 'lambo') {
            carInfo[0] = 199800;
            carInfo[1] = '2019 Lamborghini Huracan';
        } else if (cmd === 'viper') {
            carInfo[0] = 150000;
            carInfo[1] = 'Dodge Viper';
        }
        console.log(`** Current ${cmd} price message sent`);
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `A ${carInfo[1]} costs roughly **${numberWithCommas((carInfo[0] / data.geckoInfo.current_price).toFixed(2))} TRTL**`
        });
    }
}

function handleMcap(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.geckoInfo.market_cap, channelID, evt) === undefined) {
        return;
    } else {
        botReact(channelID, evt, '☑');
        console.log('** Current market cap message sent');
        bot.sendMessage({
            to: channelID,
            message: `TurtleCoin's market cap is **$${numberWithCommas(data.geckoInfo.market_cap.toFixed(2))}** USD`
        });
    }
}

function handleNetwork(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.networkInfo, channelID, evt) === undefined || !checkDataAvailable(data.transactionInfo.length, channelID, evt) === undefined || !checkDataAvailable(data.totalNodes.globalData.nodeCount, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Network info message sent');
        botReact(channelID, evt, '⚡');
        bot.sendMessage({
            to: channelID,
            embed: {
                color: Constants.embedColor,
                thumbnail: {
                    url: Constants.embedLogo,
                },
                fields: [{
                        name: 'Network Stats',
                        value: `Height: **${numberWithCommas(data.networkInfo.height)}**\n` +
                            `Network Hashrate: **${((data.networkInfo.difficulty / 30) / 1000000).toFixed(2)} MH/s**\n` +
                            `Total Nodes: **${numberWithCommas(data.totalNodes.globalData.nodeCount)}**`
                    },
                    {
                        name: 'Coin Movement',
                        value: `Block Reward: **${numberWithCommas((data.networkInfo.reward / 100).toFixed(2))} TRTL**\n` +
                            `TX in Mempool: **${data.transactionInfo.length}**\n` +
                            `Avg TX/Block: **${(data.networkInfo.alreadyGeneratedTransactions / data.networkInfo.height).toFixed(2)}**\n`
                    }
                ],
                footer: {
                    text: 'MarketTalk © 2019 ExtraHash'
                }
            }
        });
    }
}

function handlePrice(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.geckoInfo, channelID, evt) === undefined || !checkDataAvailable(data.geckoBTCPrice, channelID, evt) === undefined || !checkDataAvailable(data.geckoLTCPrice, channelID, evt) === undefined || !checkDataAvailable(data.bitcoinInfo, channelID, evt) === undefined || !checkDataAvailable(data.litecoinInfo, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Price info message sent');
        botReact(channelID, evt, getGainsEmoji());
        bot.sendMessage({
            to: channelID,
            embed: {
                color: Constants.embedColor,
                thumbnail: {
                    url: Constants.embedLogo,
                },
                fields: [{
                        name: "Rank",
                        value: `${data.geckoInfo.market_cap_rank}`
                    },
                    {
                        name: "Price",
                        value: `TRTL/LTC: **${(data.geckoLTCPrice.current_price * 100000000).toFixed(0)} lit**\n` +
                            `TRTL/BTC: **${((data.geckoBTCPrice.current_price).toFixed(10) * 100000000).toFixed(2)} sat**\n` +
                            `USD Per Million: **$${(data.geckoInfo.current_price * 1000000).toFixed(2)}**\n\n`
                    },
                    {
                        name: `Movement ${getGainsEmoji()}`,
                        value: `24h Change: **${data.geckoInfo.price_change_percentage_24h.toFixed(2)}%**\n` +
                            `24h Volume: **$${numberWithCommas(data.geckoInfo.total_volume.toFixed(2))}**\n` +
                            `Market Cap: **$${numberWithCommas(data.geckoInfo.market_cap.toFixed(2))}**\n` +
                            `Current Supply: **${(data.geckoInfo.circulating_supply / 1000000000).toFixed(2)}B TRTL**`
                    }
                ],
                footer: {
                    text: `LTC: $${numberWithCommas(data.litecoinInfo.current_price.toFixed(2))}    BTC: $${numberWithCommas(data.bitcoinInfo.current_price.toFixed(2))} `
                }
            }
        });
    }
}

function handleSupply(channelID, evt, userID, args) {
    if (!checkDataAvailable(data.geckoInfo.circulating_supply, channelID, evt) === undefined) {
        return;
    } else {
        console.log('** Supply message sent');
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `The current circulating supply is **${(data.geckoInfo.circulating_supply / 1000000000).toFixed(2)}B TRTL**`
        });
    }
}

function handleEcho(channelID, evt, userID, echo) {
    bot.sendMessage({
        to: Constants.fit,
        message: `${echo}`
    })
}

// function to add a reaction
function botReact(channelID, evt, reaction) {
    bot.addReaction({
        channelID: channelID,
        messageID: evt.d.id,
        reaction: reaction
    });
}

// function to decide emoji to print
function getGainsEmoji() {
    return data.geckoInfo.price_change_percentage_24h > 0 ? '📈' : '📉';
}

// function to format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// check that data is defined
function checkDataAvailable(item, channelID, evt) {
    if (item === undefined) {
        botReact(channelID, evt, '🚫');
        bot.sendMessage({
            to: channelID,
            message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
        });
    }
    return item !== undefined;
}