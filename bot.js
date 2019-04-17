// requires
const discord = require('discord.io');
const fs = require('fs');
const config = require('./config.json')
const Data = require('./data.js');
let brainlets = require('./brainlets.json');

const data = new Data();
const bot = new discord.Client({
    token: config.authtoken,
    autorun: true
});

// message handling
function handleBrainlet(channelID, evt, userID, args) {
    // check that user has permissions
    if (config.adminID.indexOf(userID) > -1) {
        // check if argument is valid
        if (args[0] === '<' && args[1] === '@') {
            let newBrainlet;
            // sanitize input
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
                // add brainlet to array and write to file
                brainletArray.push(newBrainlet);
                fs.writeFile('./brainlets.json', JSON.stringify(brainletArray), function(err) {
                    if (err) throw err;
                });
                brainlets = brainletArray;
            }
        };
    } else {
        console.log('** brainletted unauthorized user');
        botReact(channelID, evt, {
            name: 'brainlet',
            id: '556550665095086080'
        });
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

function handleClearBrainlets(channelID, evt, userID, args) {
    if (config.adminID.indexOf(userID) > -1) {
        botReact(channelID, evt, '☑');
        const emptyArray = [];
        brainlets = emptyArray;
        fs.writeFile('./brainlets.json', JSON.stringify(emptyArray), function(err) {
            if (err) throw err;
            console.log('** all brainlets deleted');
        })
    } else {
        botReact(channelID, evt, {
            name: 'brainlet',
            id: '556550665095086080'
        });
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

function handleDifficulty(channelID, evt, userID, args) {
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

function handleHashrate(channelID, evt, userID, args) {
    // check that none of the variables are undefined
    if (data.networkInfo === undefined) {
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
            message: `The current global hashrate is **${((data.networkInfo.difficulty / 30) / 1000000).toFixed(2)} MH/s**`
        });
    }
}

function handleHeight(channelID, evt, userID, args) {
    // check that none of the variables are undefined
    if (data.networkInfo.height === undefined) {
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
    // check that none of the variables are undefined
    let carInfo = [];
    if (data.geckoInfo === undefined) {
        console.log('** Undefined lambo price requested');
        botReact(channelID, evt, '🚫');
        bot.sendMessage({
            to: channelID,
            message: 'Whoops! I\'m still gathering data for you, please try again later. 😄'
        });
    } else {
        if (cmd === 'lambo') {
            carInfo[0] = 199800;
            carInfo[1] = '2019 Lamborghini Huracan';
        } else if (cmd === 'viper') {
            carInfo[0] = 150000;
            carInfo[1] = 'Dodge Viper';
        }
        console.log('** Current lambo price message sent');
        botReact(channelID, evt, '☑');
        bot.sendMessage({
            to: channelID,
            message: `A ${carInfo[1]} costs roughly **${numberWithCommas((carInfo[0] / data.geckoInfo.current_price).toFixed(2))} TRTL**`
        });
    }
}

function handleMcap(channelID, evt, userID, args) {
    // check that none of the variables are undefined
    if (data.networkInfo.height === undefined) {
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
            message: `TurtleCoin's market cap is **$${numberWithCommas(data.geckoInfo.market_cap.toFixed(2))}** USD`
        });
    }
}

function handleNetwork(channelID, evt, userID, args) {
    // check that none of the variables are undefined
    if (data.networkInfo === undefined || data.transactionInfo === undefined) {
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
    // check that none of the variables are undefined
    if (data.geckoInfo === undefined || data.geckoLTCPrice === undefined || data.geckoBTCPrice === undefined) {
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
    // check that none of the variables are undefined
    if (data.networkInfo === undefined) {
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
            message: `The current circulating supply is **${(data.geckoInfo.circulating_supply / 1000000000).toFixed(2)}B TRTL**`
        });
    }
}

function handleUnbrainlet(channelID, evt, userID, args) {
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
        botReact(channelID, evt, {
            name: 'brainlet',
            id: '556550665095086080'
        });
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
    if (data.geckoInfo.price_change_percentage_24h > 0) {
        return '📈';
    } else {
        return '📉';
    }
}

// function to format numbers with commas like currency
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// reconnect if disconected
bot.on('disconnect', function() {
    console.log("** Bot disconnected, reconnecting...");
    bot.connect(); //Auto reconnect
});

// error logging
bot.on('error', console.error);

// on message handling
bot.on('message', (user, userID, channelID, message, evt) => {

    // brainlet users in the brainlet array
    if (brainlets.indexOf(userID) > -1) {
        botReact(channelID, evt, {
            name: 'brainlet',
            id: '556550665095086080'
        });
    }

    // listen for messages that will start with `!`
    if (message[0] === '!') {
        const [cmd, args] = message.substring(1).split(' ');
        switch (cmd) {
            case 'difficulty':
                {
                    handleDifficulty(channelID, evt, userID, args);
                    break;
                }
            case 'brainlet':
                {
                    handleBrainlet(channelID, evt, userID, args);
                    break;
                }
            case 'clearbrainlets':
                {
                    handleClearBrainlets(channelID, evt, userID, args);
                    break;
                }
            case 'hashrate':
                {
                    handleHashrate(channelID, evt, userID, args);
                    break;
                }
            case 'height':
                {
                    handleHeight(channelID, evt, userID, args);
                    break;
                }
            case 'help':
                {
                    handleHelp(channelID, evt, userID, args);
                    break;
                }
            case 'lambo':
            case 'viper':
                {
                    console.log(cmd);
                    handleCar(channelID, evt, userID, args, cmd);
                    break;
                }
            case 'mcap':
                {
                    handleMcap(channelID, evt, userID, args);
                    break;
                }
            case 'network':
                {
                    handleNetwork(channelID, evt, userID, args);
                    break;
                }
            case 'price':
                {
                    handlePrice(channelID, evt, userID, args);
                    break;
                }
            case 'supply':
                {
                    handleSupply(channelID, evt, userID, args);
                    break;
                }
            case 'unbrainlet':
                {
                    handleUnbrainlet(channelID, evt, userID, args);
                    break;
                }
        }
    }
});

// on log in
bot.on('ready', (evt) => {
    console.log(`** Connected, logged in as ${bot.username}-${bot.id} and listening for commands.`);
});

(async function init() {
    await data.init();
})();