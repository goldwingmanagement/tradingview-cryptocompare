import * as React from 'react';
import './index.css';
import {
	widget,
	ChartingLibraryWidgetOptions,
	IChartingLibraryWidget,
	ResolutionString,
	IBasicDataFeed,
	IDatafeedChartApi,
	IExternalDatafeed,
	IDatafeedQuotesApi,
	ContextMenuItem,
} from '../../charting_library';
import Datafeed from './api/index';
import { connect } from 'react-redux';
import { PreferenceState } from '../../redux/slices/preference';
import { AuthenticationState } from '../../redux/slices/authentication';
import { getCoins, getExchangeMarkets, getExchanges } from '../../redux/slices/market';

export interface ChartContainerProps {
	symbol: ChartingLibraryWidgetOptions['symbol'];
	interval: ChartingLibraryWidgetOptions['interval'];

	// BEWARE: no trailing slash is expected in feed URL
	datafeed: IBasicDataFeed | (IDatafeedChartApi & IExternalDatafeed & IDatafeedQuotesApi) | undefined;
	library_path: ChartingLibraryWidgetOptions['library_path'];
	chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
	chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
	clientId: ChartingLibraryWidgetOptions['client_id'];
	userId: ChartingLibraryWidgetOptions['user_id'];
	fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
	autosize: ChartingLibraryWidgetOptions['autosize'];
	studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
	container: ChartingLibraryWidgetOptions['container'];
	auto_save_delay: ChartingLibraryWidgetOptions['auto_save_delay'];
	theme: string;
	overrides: ChartingLibraryWidgetOptions['overrides'];
	authentication: AuthenticationState | undefined | null;
	preference: PreferenceState | undefined | null;
	getExchanges: any;
	getCoins: any;
	getExchangeMarkets: any;
}

export interface ChartContainerState {
	marketsOpen: boolean;
	depthChartOpen: boolean;
	orderBookOpen: boolean;
	watchListOpen: boolean;
}

class TVChartContainer extends React.PureComponent<Partial<ChartContainerProps>, ChartContainerState> {
	public static defaultProps: ChartContainerProps = {
		symbol: 'Coinbase:BTC/USD',
		interval: '5' as ResolutionString,
		container: 'tv_chart_container',
		datafeed: undefined,
		library_path: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: undefined, // Chart and studies are saved under clientId
		userId: undefined, // This should change per user so they have their own
		fullscreen: false,
		autosize: true,
		auto_save_delay: 60,
		studiesOverrides: {},
		theme: 'Light', // Value can be Light or Dark
		overrides: {},
		authentication: null,
		preference: null,
		getExchanges: null,
		getCoins: null,
		getExchangeMarkets: null,
	};

	private tvWidget: IChartingLibraryWidget | null = null;

	public componentDidMount(): void {
		this.props.getCoins();
		this.props.getExchanges();
		this.props.getExchangeMarkets();
		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: this.props.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new Datafeed(),
			interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
			container: this.props.container as ChartingLibraryWidgetOptions['container'],
			library_path: this.props.library_path as string,

			locale: 'en',
			disabled_features: [],
			enabled_features: [ // https://github.com/tradingview/charting_library/wiki/Featuresets
				'study_templates', 
				'use_localstorage_for_settings',
				'side_toolbar_in_fullscreen_mode',
				'header_in_fullscreen_mode'
			],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.authentication?.clientId,
			user_id: this.props.authentication?.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
			theme: this.props.preference?.theme
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		// This area is used to modify TV's look including context menus
		tvWidget.onChartReady(() => {
			tvWidget.headerReady().then(() => {

				const lightButton = tvWidget.createButton({align: 'right'});
				lightButton.setAttribute('title', 'Light');
				lightButton.classList.add('apply-light-theme');
				lightButton.addEventListener('click', () => {
					tvWidget.changeTheme('Light');
				});
				lightButton.innerHTML = 'Light';

				const darkButton = tvWidget.createButton({align: 'right'});
				darkButton.setAttribute('title', 'Dark');
				darkButton.classList.add('apply-dark-theme');
				darkButton.addEventListener('click', () => {
					tvWidget.changeTheme('Dark');
				});
				darkButton.innerHTML = 'Dark';
			});
			tvWidget.onContextMenu(function(unixtime: number, price: number): ContextMenuItem[] {
				var items: ContextMenuItem[] = [{
					position: 'top',
					text: 'Light Mode',
					click: function() {
						tvWidget.changeTheme('Light');
					}
				}, {
					position: 'top',
					text: 'Dark Mode',
					click: function() {
						tvWidget.changeTheme('Dark');
					}
				}, {
					text: '-',
					position: 'top',
					click: () => {
						// Separator, do nothing
					}
				}];
				return items;
			});
		});
	}

	public componentWillUnmount(): void {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	public render(): JSX.Element {
		return (
			<div style={ { display: 'flex', flexDirection: 'column' } }>
				<div 
					id={ this.props.container?.toString() }
					className={ 'TVChartContainer' }
				/>
			</div>
		);
	}
}

function mapStateToProps(state: any) {
	return {
		authentication: state.authentication,
		preference: state.preference
	};
}

const mapDispatchToProps = {
	getCoins,
	getExchangeMarkets,
	getExchanges
}

export default connect(mapStateToProps, mapDispatchToProps)(TVChartContainer);
