import { PeriodParams, ResolutionString, LibrarySymbolInfo } from '../../../charting_library';
import axios from 'axios';

const apiRoot = 'https://min-api.cryptocompare.com';

const history: any = {};

const historical = {
    history: history,
    getBars: async function (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams) {
        const splitSymbol = symbolInfo.name.split(/[:/]/);
        const url = resolution === 'D' ? '/data/histoday' : Number.parseInt(resolution) >= 60 ? '/data/histohour' : '/data/histominute';
        const qs = {
            e: splitSymbol[0],
            fsym: splitSymbol[1],
            tsym: splitSymbol[2],
            toTs:  periodParams.to ? periodParams.to : '',
            limit: periodParams.countBack ? periodParams.countBack : 2000,
        };

        const response = await axios.get(`${apiRoot}${url}`, {params: qs});
        if (response.status !== 200) {
            console.log('CryptoCompare API error:', response.statusText);
            console.trace(response.statusText);
        }
        const json = response.data;
        if (json.Data.length) {
            console.log(`Actually returned: ${new Date(json.TimeFrom * 1000).toISOString()} - ${new Date(json.TimeTo * 1000).toISOString()}`);
            const bars = json.Data.map((el: CBar) => {
                return {
                    time: el.time * 1000,
                    low: el.low,
                    high: el.high,
                    open: el.open,
                    close: el.close,
                    volume: el.volumefrom
                };
            });
            if (periodParams.countBack) {
                const lastBar = bars[bars.length - 1];
                history[symbolInfo.name] = { lastBar: lastBar };
            }
            return bars;
        } else {
            return [];
        }
    }
};

export default historical;

export interface CBar {
  time: number; 
  low: number; 
  high: number; 
  open: number; 
  close: number; 
  volumefrom: number; 
}
