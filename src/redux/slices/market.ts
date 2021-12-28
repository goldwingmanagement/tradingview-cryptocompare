import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// utils
import axios from 'axios';
import { WritableDraft } from 'immer/dist/internal';
import { SearchSymbolResultItem } from '../../charting_library/charting_library';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

interface MarketState {
  searchSymbols: SearchSymbolResultItem[];
  exchanges: [];
  coins: [];
  error: Error | string | null;
}

// ----------------------------------------------------------------------

const initialState = {
  searchSymbols: [],
  exchanges: [],
  coins: [],
  error: null
} as MarketState;

const slice = createSlice({
  name: 'market',
  initialState,
  reducers: {
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

// Actions
export function getCoins() {
  return async() => {
    try {
      const response = await axios.get('https://min-api.cryptocompare.com/data/all/coinlist');
      if (response.status !== 200) {
        console.log(response.statusText)
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
      const response = await axios.get('https://min-api.cryptocompare.com/data/v4/all/exchanges');
      if (response.status !== 200) {
        console.log(response.statusText)
      } else {
        const exchanges = response.data.Data.exchanges;
        dispatch(slice.actions.setExchanges(exchanges));

        var searchSymbols: SearchSymbolResultItem[] = [];
        Object.keys(exchanges).forEach(exchange => {
          const markets = exchanges[exchange].pairs;
          Object.keys(markets).forEach(symbol => {
            const tsyms = markets[symbol].tsyms;
            Object.keys(tsyms).forEach(fsym => {
              const searchSymbol: SearchSymbolResultItem = {
                symbol: symbol + '/' + fsym,
                full_name: exchange + ':' + symbol + '/' + fsym,
                ticker: symbol + '/' + fsym,
                type: 'crypto',
                description: '',
                exchange: exchange
              }
              searchSymbols.push(searchSymbol);
            });
          });
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