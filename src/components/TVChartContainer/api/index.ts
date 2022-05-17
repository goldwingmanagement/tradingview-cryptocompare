import { 
	ErrorCallback, 
	HistoryCallback, 
	IBasicDataFeed, 
	LibrarySymbolInfo, 
	OnReadyCallback, 
	PeriodParams, 
	ResolutionString, 
	ResolveCallback, 
	SearchSymbolsCallback, 
	SubscribeBarsCallback, 
	SymbolResolveExtension,
	DatafeedConfiguration,
} from '../../../charting_library/charting_library';

import historyProvider from './history';
import stream from './stream';
import { RootState, store } from '../../../redux/store';
import { setCurrentSymbol } from '../../../redux/slices/market';

const supportedResolution: ResolutionString[] = [
	'1' as ResolutionString,
	'5' as ResolutionString,
	'15' as ResolutionString,
	'30' as ResolutionString,
	'60' as ResolutionString,
	'120' as ResolutionString,
	'240' as ResolutionString,
	'360' as ResolutionString,
	'480' as ResolutionString,
	'720' as ResolutionString,
];

class Datafeed implements IBasicDataFeed {
	protected _configuration: Configuration = defaultConfiguration();

	async searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback): Promise<void> {
		console.log('TradingView "searchSymbols" running.');
		const data: RootState = store.getState();
		const searchSymbolList = data.market.searchSymbols;
		if (exchange === 'ALL') {
			const filter = searchSymbolList.filter(x => x.full_name.toUpperCase().includes(userInput.toUpperCase())).slice(0, 100);
			onResult(filter);
		} else {
			const filter = searchSymbolList.filter(x => x.full_name.toUpperCase().includes(userInput.toUpperCase()) && 
			x.exchange.toUpperCase().includes(exchange.toUpperCase())).slice(0, 100);
			onResult(filter);
		}
	}
	resolveSymbol(symbolName: string, onResolve: ResolveCallback, onError: ErrorCallback, extension?: SymbolResolveExtension): void {
		console.log('TradingView "resolveSymbol" running.');
		try {
			// symbolName is the full_name
			store.dispatch(setCurrentSymbol(symbolName));
			var splitData = symbolName.split(/[:/]/);
			var symbolStub: LibrarySymbolInfo = {
				name: symbolName,
				description: '',
				type: 'crypto',
				session: '24x7',
				timezone: 'Etc/UTC',
				ticker: symbolName,
				exchange: splitData[0],
				minmov: 1,
				pricescale: 100000000,
				has_intraday: true,
				intraday_multipliers: ['1', '5', '15', '30', '60', '120', '240', '360', '480', '720'],
				supported_resolutions: supportedResolution,
				volume_precision: 8,
				data_status: 'streaming',
				full_name: '',
				listed_exchange: '',
				format: 'price'
			};
			setTimeout(() => onResolve(symbolStub), 0);
		} catch (err) {
			console.trace(err);
			// onError(err);
		}
	}
	getBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams, onResult: HistoryCallback, onError: ErrorCallback): void {
		console.log('TradingView "getBars" running.');
		periodParams.countBack = 2000;
		historyProvider.getBars(symbolInfo, resolution, periodParams)
		.then(bars => {
			if (bars.length) {
				onResult(bars, {noData: false});
			} else {
				onResult(bars, {noData: true});
			}
		}).catch(err => {
			console.log('Errors loading bars');
			console.log({err});
			onError(err);
		});
	}
	subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void): void {
		console.log('TradingView "subscribeBars" running.');
		stream.subscribeBars(symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback);
	}
	unsubscribeBars(listenerGuid: string): void {
		console.log('TradingView "unsubscribeBars" running.');
		stream.unsubscribeBars(listenerGuid);
	}
	async onReady(callback: OnReadyCallback): Promise<void> {
		console.log('TradingView "onReady" running.');
		const data: RootState = store.getState();
		const exchanges = data.market.exchanges;
		this._configuration.exchanges = exchanges;
		setTimeout(() => callback(this._configuration), 0);
	}
}

export default Datafeed;

export interface IExchange {
	value: string,
	name: string,
	desc: string,
}

export interface Configuration extends DatafeedConfiguration {
	exchanges: any;
	supports_search: boolean;
	supports_group_request: boolean;
	supported_resolutions: ResolutionString[];
	supports_marks: boolean;
	supports_timescale_marks: boolean;
}

function defaultConfiguration(): Configuration {
	return {
		exchanges: [],
		supports_search: true,
		supports_group_request: true,
		supported_resolutions: supportedResolution,
		supports_marks: true,
		supports_timescale_marks: true,
	};
}