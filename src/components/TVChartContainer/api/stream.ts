// api/stream.js
import historyProvider from './history';
import environment from '../../../environment.json';
import { Bar, Sub } from '../../../general/models';
import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '../../../charting_library/charting_library';

const apiKey = environment.apiKey;
const url = 'wss://streamer.cryptocompare.com/v2?api_key=' + apiKey;

const wss = new WebSocket(url);

// keep track of subscriptions
const _subs: Sub[] = [];

const subscription =  {
    subscribeBars: function(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void) {
    // NOTE for cryptocompare, they deprecated socket.io socket but we don't care, we
    // need to subscribe to our own sockets
    
        const channelString = createChannelString(symbolInfo);
        wss.send(JSON.stringify({action: 'SubAdd', subs: [channelString]}));
    
        const newSub = {
            channelString,
            listenerGuid,
            resolution,
            symbolInfo,
            lastBar: historyProvider.history[symbolInfo.name].lastBar,
            listener: onTick,
        };
        _subs.push(newSub);
    },
    unsubscribeBars: function(listenerGuid: string) {
        const subIndex = _subs.findIndex(e => e.listenerGuid === listenerGuid);
        if (subIndex === -1) {
            return;
        }
        const sub = _subs[subIndex];
        wss.send(JSON.stringify({action: 'SubRemove', subs: [sub.channelString]}));
        _subs.splice(subIndex, 1);
    }
};

export default subscription;

wss.onmessage = (message: any) => {
    try {
        const _data = JSON.parse(message.data);
        if (Number.parseInt(_data.TYPE) !== 0) {
            return;
        } 
        const data = {
            sub_type: Number.parseInt(_data.TYPE),
            exchange: _data.M,
            to_sym: _data.TSYM,
            from_sym: _data.FSYM,
            trade_id: _data.ID,
            ts: Number.parseInt(_data.TS),
            volume: Number.parseFloat(_data.Q),
            price: Number.parseFloat(_data.P)
        };
    
        const channelString = `${data.sub_type}~${data.exchange}~${data.from_sym}~${data.to_sym}`;
        let sub: Sub;
        for (const key in _subs) {
            if (_subs[key].channelString === channelString) {
                sub = _subs[key];
                if (data.ts < sub.lastBar.time / 1000) {
                    return;
                }
                const _lastBar = updateBar(data, sub);
  
                // send the most recent bar back to TV's realtimeUpdate callback
                sub.listener(_lastBar);
                // update our own record of lastBar
                sub.lastBar = _lastBar;
            }
        }
    } catch (err) {
        console.log(err);
    }
};

// Take a single trade, and subscription record, return updated bar
function updateBar(data: { sub_type?: number; exchange?: any; to_sym?: any; from_sym?: any; trade_id?: any; ts: any; volume: any; price: any }, sub: { lastBar: any; resolution: any }) {
    const lastBar = sub.lastBar;
    let resolution = sub.resolution;
    if (resolution.includes('D')) {
    // 1 day in minutes === 1440
        resolution = 1440;
    } else if (resolution.includes('W')) {
    // 1 week in minutes === 10080
        resolution = 10080;
    }
    const coeff = resolution * 60;
    // console.log({coeff})
    const rounded = Math.floor(data.ts / coeff) * coeff;
    const lastBarSec = lastBar.time / 1000;
    let _lastBar: Bar;
  
    if (rounded > lastBarSec) {
    // create a new candle, use last close as open **PERSONAL CHOICE**
        _lastBar = {
            time: rounded * 1000,
            open: lastBar.close,
            high: lastBar.close,
            low: lastBar.close,
            close: data.price,
            volume: data.volume
        };
    } else {
    // update lastBar candle!
        if (data.price < lastBar.low) {
            lastBar.low = data.price;
        } else if (data.price > lastBar.high) {
            lastBar.high = data.price;
        }
    
        lastBar.volume += data.volume;
        lastBar.close = data.price;
        _lastBar = lastBar;
    }
    return _lastBar;
}

// takes symbolInfo object as input and creates the subscription string to send to CryptoCompare
function createChannelString(symbolInfo: LibrarySymbolInfo) {
    const channel = symbolInfo.name.split(/[:/]/);
    const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0];
    const to = channel[2];
    const from = channel[1];
    // subscribe to the CryptoCompare trade channel for the pair and exchange
    return `0~${exchange}~${from}~${to}`;
}
