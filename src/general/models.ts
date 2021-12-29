import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from "../charting_library/charting_library";
import { OrderType, OrderTimeInForce, OrderState, AccountStatus, OrderSide } from "./enumerations";

export interface Account {
  name: string,
  startingBalance: number,
  endingBalance: number,
  status: AccountStatus
}

export interface Order {
  symbol: string,
  side: OrderSide,
  state: OrderState,
  type: OrderType,
  timeInForce: OrderTimeInForce,
  expiration: Date,
  openDate: Date,
  closeDate: Date,
  openPrice: number,
  fillPrice: number,
  closePrice: number,
  stopLoss: number,
  takeProfit: number,
  profitLoss: number,
  comment: string
}

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