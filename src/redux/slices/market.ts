import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
import axios from 'axios';
import { WritableDraft } from 'immer/dist/internal';
import { SearchSymbolResultItem } from '../../charting_library/charting_library';
import { IExchange } from '../../components/TVChartContainer/api';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

interface MarketState {
  currentSymbol: string | null;
  currentHistory: [];
  searchSymbols: SearchSymbolResultItem[];
  exchanges: [];
  coins: [];
  error: Error | string | null;
}

// ----------------------------------------------------------------------

const initialState = {
    currentSymbol: null,
    currentHistory: [],
    searchSymbols: [],
    exchanges: [],
    coins: [],
    error: null
} as MarketState;

const slice = createSlice({
    name: 'market',
    initialState,
    reducers: {
        setCurrentSymbol(state: WritableDraft<MarketState>, action: PayloadAction<any>) {
            state.currentSymbol = action.payload;
        },

        setSearchSymbols(state: WritableDraft<MarketState>, action: PayloadAction<any>) {
            state.searchSymbols = action.payload;
        },

        setExchanges(state: WritableDraft<MarketState>, action: PayloadAction<any>) {
            state.exchanges = action.payload;
        },

        setCoins(state: WritableDraft<MarketState>, action: PayloadAction<any>) {
            state.coins = action.payload;
        },

        // SET ERROR
        setError(state: WritableDraft<MarketState>, action: PayloadAction<string>) {
            state.error = action.payload;
        }
    },
});

// Reducer
export default slice.reducer;

export const { setExchanges, setCurrentSymbol } = slice.actions;

// Actions
export function getCoins() {
    return async() => {
        try {
            const response = await axios.get('https://min-api.cryptocompare.com/data/all/coinlist');
            if (response.status !== 200) {
                console.log(response.statusText);
            } else {
                dispatch(slice.actions.setCoins(response.data.Data));
            }
        } catch (err) {
            if (typeof err === 'string') {
                dispatch(slice.actions.setError(err));
            } else if (err instanceof Error) {
                dispatch(slice.actions.setError(err.message));
            }
        }
    };
}

export function getExchanges() {
    return async() => {
        try {
            const exchangeDetail: IExchange[] = [];
            exchangeDetail.push({
                name: 'ALL',
                value: 'ALL',
                desc: 'All Exchanges'
            });
            const response = await axios.get('https://min-api.cryptocompare.com/data/exchanges/general');
            if (response.status !== 200) {
                console.log(response.statusText);
                return exchangeDetail;
            } else {
                const data = response.data.Data;
                Object.keys(data).forEach(item => {
                    const exchange = data[item];
                    if (exchange.Country === 'U.S.A') {
                        exchangeDetail.push({
                            name: exchange.InternalName,
                            value: exchange.InternalName,
                            desc: exchange.Name
                        });
                    }
                });
                dispatch(setExchanges(exchangeDetail));
                return exchangeDetail;
            }
        } catch (err) {
            if (typeof err === 'string') {
                dispatch(slice.actions.setError(err));
            } else if (err instanceof Error) {
                dispatch(slice.actions.setError(err.message));
            }
        }
    };
}

export function getExchangeMarkets() {
    return async() => {
        try {
            const response = await axios.get('https://min-api.cryptocompare.com/data/v4/all/exchanges');
            if (response.status !== 200) {
                console.log(response.statusText);
            } else {
                const exchanges = response.data.Data.exchanges;
                dispatch(slice.actions.setExchanges(exchanges));
                const searchSymbols: SearchSymbolResultItem[] = [];
                Object.keys(exchanges).forEach(exchange => {
                    if (exchanges[exchange].isActive) {
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
                                };
                                searchSymbols.push(searchSymbol);
                            });
                        });
                    }
                });
                dispatch(slice.actions.setSearchSymbols(searchSymbols));
            }
        } catch (err) {
            if (typeof err === 'string') {
                dispatch(slice.actions.setError(err));
            } else if (err instanceof Error) {
                dispatch(slice.actions.setError(err.message));
            }
        }
    };
}