import axios from 'axios';
import { IExchange } from '.';
import { SearchSymbolResultItem } from '../../../charting_library/charting_library';

var _searchSymbolList: SearchSymbolResultItem[] = [];

const symbols = {
  getSymbolList: function(){
    return _searchSymbolList;
  },
  getExchangeList: async function() {
    const exchangeDetail: IExchange[] = [];
    exchangeDetail.push({
      name: 'ALL',
      value: 'ALL',
      desc: 'All Exchanges'
    });
    const response = await axios.get('https://min-api.cryptocompare.com/data/exchanges/general');
    if (response.status !== 200) {
      console.log(response.statusText)
      return exchangeDetail;
    } else {
      const data = response.data.Data;
      Object.keys(data).forEach(item => {
        var exchange = data[item];
        if (exchange.Country === 'U.S.A') {
          exchangeDetail.push({
            name: exchange.InternalName,
            value: exchange.InternalName,
            desc: exchange.Name
          });
        }
      });
      return exchangeDetail;
    }
  },
  getSymbols: async function(exchangeList: IExchange[]) {
    const response = await axios.get('https://min-api.cryptocompare.com/data/v4/all/exchanges');
    if (response.status !== 200) {
      console.log(response.statusText)
    } else {
      const exchanges = response.data.Data.exchanges;
      var searchSymbols: SearchSymbolResultItem[] = [];
      Object.keys(exchanges).forEach(exchange => {
        if (exchangeList.filter(x => x.name === exchange).length > 0) {
          const markets = exchanges[exchange].pairs;
          Object.keys(markets).forEach(symbol => {
            const tsyms = markets[symbol].tsyms;
            Object.keys(tsyms).forEach(fsym => {
              const searchSymbol: SearchSymbolResultItem = {
                symbol: symbol + '/' + fsym,
                full_name: exchange + ':' + symbol + '/' + fsym,
                ticker: exchange + ':' + symbol + '/' + fsym,
                type: 'crypto',
                description: exchange + ':' + symbol + '/' + fsym,
                exchange: exchange
              }
              searchSymbols.push(searchSymbol);
            });
          });
        }
      });
      _searchSymbolList = searchSymbols;
    }
  }
}

export default symbols;