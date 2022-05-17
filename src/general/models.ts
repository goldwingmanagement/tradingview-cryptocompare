import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '../charting_library/charting_library';

export interface Sub {
  listenerGuid: string;
  channelString: string;
  resolution: ResolutionString;
  symbolInfo: LibrarySymbolInfo;
  lastBar: Bar;
  listener: SubscribeBarsCallback;
}

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}