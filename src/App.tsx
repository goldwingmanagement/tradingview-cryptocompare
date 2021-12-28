import TVChartContainer from './components/TVChartContainer/index';
import { dispatch } from './redux/store';
import { getCoins, getExchanges } from './redux/slices/market';
function App() {
	dispatch(getCoins());
	dispatch(getExchanges());
	return (
		<div>
			<TVChartContainer />
		</div>
	);
}

export default App;
