# CryptoCompare Trading View
This is a typescript implementation of TradingView based on USA crypto exchanges.  It uses CryptoCompare to retrieve data.

## Configuration
In /src/environment.json, set your apiKey from Cryptocompare, this will allow you to connect into their websocket to subscribe to data.

## Trading View Charting Library
I am not able to package Trading View's library due to it's license.  You must first apply for access to their Git repository here [Charting Library](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/).  Once done, copy the charting_library folder into public and src.

## Running project
Start project by running the following in terminal or command prompt:

```bash
npm start
```