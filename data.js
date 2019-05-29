const request = require('request-promise');

class PriceData {
    async init() {
        await this.update();
        setInterval(() => this.update(), 10000);
    }
    async update() {
        this.geckoInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoTRTLInfo'))[0];
        this.geckoLTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=ltc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d'))[0];
        this.geckoBTCPrice = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=btc&ids=turtlecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d', 'geckoBTCPrice'))[0];
        this.networkInfo = await getData('https://blockapi.turtlepay.io/block/header/top', 'networkQuery');
        this.transactionInfo = await getData('https://blockapi.turtlepay.io/transaction/pool', 'transactionQuery');
        this.litecoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=litecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoLTCInfo'))[0];
        this.bitcoinInfo = (await getData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false', 'geckoBTCInfo'))[0];
        this.totalNodes = await getData('https://shellmap.mine2gether.com/api/stats', 'shellmaps');
    }
};

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

module.exports = PriceData;