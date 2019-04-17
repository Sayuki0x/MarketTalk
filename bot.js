// requires
const discord = require('discord.io');
const request = require('request-promise');
const fs = require('fs');
let brainlets = require('./brainlets.json');
const config = require('./config.json')

// data class
class Data {
    async classinit() {
        await this.dataupdate();
        setInterval(this.dataupdate, 10000);
    }
    async dataupdate() {
        this.geckoInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoTRTLInfo'))[0];
        this.geckoLTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=ltc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d'))[0];
        this.geckoBTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=btc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d', 'geckoBTCPrice'))[0];
        this.networkInfo = await getData('https://blockapi.turtlepay.io/block/header/top', 'networkQuery');
        this.transactionInfo = await getData('https://blockapi.turtlepay.io/transaction/pool', 'transactionQuery');
        this.litecoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=litecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoLTCInfo'))[0];
        this.bitcoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoBTCInfo'))[0];
        this.totalNodes = await getData('https://shellmap.mine2gether.com/api/stats', 'shellmaps');
        console.log(this.networkInfo);
    }
};

const data = new Data();

// variable area
const Globals = {
    geckoInfo: undefined,
    geckoBTCPrice: undefined,
    geckoLTCPrice: undefined,
    litecoinInfo: undefined,
    bitcoinInfo: undefined,
    networkInfo: undefined,
    transactionInfo: undefined,
    totalNodes: undefined
};

const bot = new discord.Client({
    token: config.authtoken,
    autorun: true
});



// function to add a reaction
function botReact(channelID, evt, reaction) {
    bot.addReaction({
        channelID: channelID,
        messageID: evt.d.id,
        reaction: reaction
    });
}

// function to format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function to decide emoji to print
function getGainsEmoji() {
    if (Globals.geckoInfo.price_change_percentage_24h > 0) {
        return '📈';
    } else {
        return '📉';
    }
}

// Initialize Discord Bot
init();

// refreshes variables every 5s
async function init() {
    await data.classinit();
}

// get data from http request and store it in variable
async function getData(apiURL, name) {
    const requestOptions = {
        method: 'GET',
        uri: apiURL,
        headers: {},
        json: true,
        gzip: true
    };
    try {
        const result = await request(requestOptions);
        // console.log(apiURL, name, result);
        return result;
    } catch (err) {
        console.log(`Request failed, ${name} API call error: \n`, err);
        return undefined;
    }
}

// get data
async function update() {
    // get all api data
    Globals.geckoInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoTRTLInfo'))[0];
    Globals.geckoLTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=ltc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d'))[0];
    Globals.geckoBTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=btc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d', 'geckoBTCPrice'))[0];
    Globals.networkInfo = await getData('https://blockapi.turtlepay.io/block/header/top', 'networkQuery');
    Globals.transactionInfo = await getData('https://blockapi.turtlepay.io/transaction/pool', 'transactionQuery');
    Globals.litecoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=litecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoLTCInfo'))[0];
    Globals.bitcoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoBTCInfo'))[0];
    Globals.totalNodes = await getData('https://shellmap.mine2gether.com/api/stats', 'shellmaps');
    console.log(data);
}

// reconnect if disconected
bot.on('disconnect', function() {
    console.log("** Bot disconnected, reconnecting...");
    bot.connect() //Auto reconnect
});

// error logging
bot.on('error', console.error);

// on message handling
bot.on('message', (user, userID, channelID, message, evt) => {

    // brainlet users in the brainlet array
    if (brainlets.indexOf(userID) > -1) {
        botReact(channelID, evt, {name: 'brainlet', id: '556550665095086080'});
    }

    // listen for messages that will start with `!`
    if (message[0] === '!') {
        const [cmd, args] = message.substring(1).split(' ');

        // brainlet command
        if (cmd === 'brainlet') {
            if (config.adminID.indexOf(userID) > -1) {
                if (args[0] === '<' && args[1] === '@') {
                    let newBrainlet;
                    let brainletID = (args.slice(0, -1)).slice(2);
                    if (brainletID[0] != '!') {
                        newBrainlet = brainletID;
                    } else {
                        newBrainlet = brainletID.slice(1);
                    }
                    let brainletArray = brainlets;
                    if (brainletArray.indexOf(newBrainlet) > -1) {
                        console.log('** requested brainlet that is already in the array');
                        botReact(channelID, evt, '🚫');
                    } else {
                        console.log('** new brainlet stored')
                        botReact(channelID, evt, '☑');
                        brainletArray.push(newBrainlet);
                        fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                            if (err) throw err;
                        });
                        brainlets = brainletArray;
                    }
                };
            } else {
                console.log('** brainletted unauthorized user');
                botReact(channelID, evt, {name: 'brainlet', id: '556550665095086080'});
                let brainletArray = brainlets;
                if (brainletArray.indexOf(userID) > -1) {
                    console.log('** automatic requested brainlet that is already in the array');
                } else {
                    brainletArray.push(userID);
                    fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                        if (err) throw err;
                        console.log('** automatic new brainlet stored')
                    });
                    brainlets = brainletArray;
                }
            }
        };

        if (cmd === 'clearbrainlets') {
            if (config.adminID.indexOf(userID) > -1) {
                botReact(channelID, evt, '☑');
                const emptyArray = [];
                brainlets = emptyArray;
                fs.writeFile('./brainlets.json', JSON.stringify(emptyArray), function(err) {
                    if (err) throw err;
                    console.log('** all brainlets deleted');
                })
            } else {
                botReact(channelID, evt, {name: 'brainlet', id: '556550665095086080'});
                let brainletArray = brainlets;
                if (brainletArray.indexOf(userID) > -1) {
                    console.log('** automatic requested brainlet that is already in the array');
                } else {
                    brainletArray.push(userID);
                    fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                        if (err) throw err;
                        console.log('** automatic new brainlet stored')
                    });
                    brainlets = brainletArray;
                }
            }
        }

        // difficulty command
        if (cmd === 'difficulty') {
            // check that none of the variables are undefined
            if (data.networkInfo.difficulty === undefined) {
                console.log('** Undefined difficulty requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current difficulty message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `The current difficulty is **${numberWithCommas(data.networkInfo.difficulty)}**`
                });
            }
        }

        // hashrate command
        if (cmd === 'hashrate') {
            // check that none of the variables are undefined
            if (Globals.networkInfo === undefined) {
                console.log('** Undefined hashrate requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current hashrate message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `The current global hashrate is **${((Globals.networkInfo.difficulty / 30) / 1000000).toFixed(2)} MH/s**`
                });
            }
        }

        // height command
        if (cmd === 'height') {
            // check that none of the variables are undefined
            if (Globals.networkInfo.height === undefined) {
                console.log('** Undefined block height requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current block height message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `The current  block height is **${numberWithCommas(Globals.networkInfo.height)}**`
                });
            }
        }

        // help command
        if (cmd === 'help') {
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
                    '!supply       :   Displays current network hashrate.\n\`\`\`'
            });
        }

        // lambo command
        if (cmd === 'lambo') {
            // check that none of the variables are undefined
            if (Globals.geckoInfo === undefined) {
                console.log('** Undefined lambo price requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current lambo price message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `A 2019 Lamborghini Huracan costs roughly **${numberWithCommas((199800 / Globals.geckoInfo.current_price).toFixed(2))} TRTL**`
                });
            }
        }

        // mcap command
        if (cmd === 'mcap') {
            // check that none of the variables are undefined
            if (Globals.networkInfo.height === undefined) {
                console.log('** Undefined market cap requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                botReact(channelID, evt, '☑');
                console.log('** Current market cap message sent');
                bot.sendMessage({
                    to: channelID,
                    message: `TurtleCoin's market cap is **$${numberWithCommas(Globals.geckoInfo.market_cap.toFixed(2))}** USD`
                });
            }
        }

        if (cmd === 'network') {
            // check that none of the variables are undefined
            if (Globals.networkInfo === undefined || Globals.transactionInfo === undefined) {
                console.log('** Undefined network info requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Network info message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        color: 3066993,
                        thumbnail: {
                            url: 'https://raw.githubusercontent.com/turtlecoin/turtlecoin.lol/master/images/favicons/apple-touch-icon-120x120.png',
                        },
                        fields: [{
                                name: 'Network Stats',
                                value: `Height: **${numberWithCommas(Globals.networkInfo.height)}**\n` +
                                    `Network Hashrate: **${((Globals.networkInfo.difficulty / 30) / 1000000).toFixed(2)} MH/s**\n` +
                                    `Total Nodes: **${numberWithCommas(Globals.totalNodes.globalData.nodeCount)}**`
                            },
                            {
                                name: 'Coin Movement',
                                value: `Block Reward: **${numberWithCommas((Globals.networkInfo.reward / 100).toFixed(2))} TRTL**\n` +
                                    `TX in Mempool: **${Globals.transactionInfo.length}**\n` +
                                    `Avg TX/Block: **${(Globals.networkInfo.alreadyGeneratedTransactions / Globals.networkInfo.height).toFixed(2)}**\n`
                            }
                        ],
                        footer: {
                            text: 'MarketTalk © 2019 ExtraHash'
                        }
                    }
                });
            }
        }

        // price command
        if (cmd === 'price') {
            // check that none of the variables are undefined
            if (Globals.geckoInfo === undefined || Globals.geckoLTCPrice === undefined || Globals.geckoBTCPrice === undefined) {
                console.log('** Undefined price info requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Price info message sent');
                botReact(channelID, evt, getGainsEmoji());
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        color: 3066993,
                        thumbnail: {
                            url: 'https://raw.githubusercontent.com/turtlecoin/turtlecoin.lol/master/images/favicons/apple-touch-icon-120x120.png',
                        },
                        fields: [{
                                name: "Rank",
                                value: `${Globals.geckoInfo.market_cap_rank}`
                            },
                            {
                                name: "Price",
                                value: `TRTL/LTC: **${(Globals.geckoLTCPrice.current_price * 100000000).toFixed(0)} lit**\n` +
                                    `TRTL/BTC: **${((Globals.geckoBTCPrice.current_price).toFixed(10) * 100000000).toFixed(2)} sat**\n` +
                                    `USD Per Million: **$${(Globals.geckoInfo.current_price * 1000000).toFixed(2)}**\n\n`
                            },
                            {
                                name: `Movement ${getGainsEmoji()}`,
                                value: `24h Change: **${Globals.geckoInfo.price_change_percentage_24h.toFixed(2)}%**\n` +
                                    `24h Volume: **$${numberWithCommas(Globals.geckoInfo.total_volume.toFixed(2))}**\n` +
                                    `Market Cap: **$${numberWithCommas(Globals.geckoInfo.market_cap.toFixed(2))}**\n` +
                                    `Current Supply: **${(Globals.geckoInfo.circulating_supply / 1000000000).toFixed(2)}B TRTL**`
                            }
                        ],
                        footer: {
                            text: `LTC: $${numberWithCommas(Globals.litecoinInfo.current_price.toFixed(2))}    BTC: $${numberWithCommas(Globals.bitcoinInfo.current_price.toFixed(2))} `
                        }
                    }
                });
            }
        }

        // supply command
        if (cmd === 'supply') {
            // check that none of the variables are undefined
            if (Globals.networkInfo === undefined) {
                console.log('** Undefined supply requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Supply message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `The current circulating supply is **${(Globals.geckoInfo.circulating_supply / 1000000000).toFixed(2)}B TRTL**`
                });
            }
        }

        // unbrainlet command
        if (cmd === 'unbrainlet') {
            if (config.adminID.indexOf(userID) > -1) {
                if (args[0] === '<' && args[1] === '@') {
                    let formerBrainlet;
                    let brainletID = (args.slice(0, -1)).slice(2);
                    if (brainletID[0] != '!') {
                        formerBrainlet = brainletID;
                    } else {
                        formerBrainlet = brainletID.slice(1);
                    }
                    let brainletArray = brainlets;
                    if (brainletArray.indexOf(formerBrainlet) === -1) {
                        console.log('** requested brainlet removal that was not in the array');
                        botReact(channelID, evt, '🚫');
                    } else {
                        console.log('** brainlet removed')
                        botReact(channelID, evt, '☑');
                        for (var i = brainletArray.length - 1; i >= 0; i--) {
                            if (brainletArray[i] === formerBrainlet) {
                                brainletArray.splice(i, 1);
                            }
                        }
                        fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                            if (err) throw err;
                        });
                        brainlets = brainletArray;
                    }
                };
            } else {
                botReact(channelID, evt, {name: 'brainlet', id: '556550665095086080'});
                let brainletArray = brainlets;
                if (brainletArray.indexOf(userID) > -1) {
                    console.log('** unauthorized user that is already in the array');
                } else {
                    brainletArray.push(userID);
                    fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                        if (err) throw err;
                        console.log('** automatic new brainlet stored')
                    });
                    brainlets = brainletArray;
                }
            }
        };

        // whine command
        if (cmd === 'whine') {
            console.log('** Told someone to nut up and stop being a sniveling bitch');
            botReact(channelID, evt, '🚫');
            bot.sendMessage({
                to: channelID,
                message: 'Don\'t be such a sniveling little bitch.'
            });
        }

        // viper command 4 phate
        if (cmd === 'viper') {
            // check that none of the variables are undefined
            if (Globals.geckoInfo === undefined) {
                console.log('** Undefined viper price requested');
                botReact(channelID, evt, '🚫');
                bot.sendMessage({
                    to: channelID,
                    message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
                });
            } else {
                console.log('** Current viper price message sent');
                botReact(channelID, evt, '☑');
                bot.sendMessage({
                    to: channelID,
                    message: `A Dodge Viper costs roughly **${numberWithCommas((150000 / Globals.geckoInfo.current_price).toFixed(2))} TRTL**`
                });
            }
        }
    }
});

// on log in
bot.on('ready', (evt) => {
    console.log(`** Connected, logged in as ${bot.username}-${bot.id} and listening for commands.`);
});