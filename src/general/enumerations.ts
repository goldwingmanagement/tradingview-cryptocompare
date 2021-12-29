export enum AccountStatus {
  ACTIVE = 'Active',
  BLOCKED = 'Blocked'
}

export enum OrderSide {
  BUY = 'Buy',
  SELL = 'Sell'
}

export enum OrderState {
  PENDING = 'Pending',
  FILLED = 'Filled',
  REJECTED = 'Rejected',
  CANCELED = 'Cancelled',
  CLOSED = 'Closed'
}

export enum OrderType {
  MARKET = 'Market',
  LIMIT = 'LIMIT',
  STOP = 'STOP'
}

export enum OrderTimeInForce {
  GTC = 'GTC',
  GTD = 'GTD',
  GTE = 'GTE'
}