import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import authenticationReducer from './slices/authentication';
import marketReducer from './slices/market';
import modalReducer from './slices/modal';
import preferenceReducer from './slices/preference';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const rootReducer = combineReducers({
  authentication: authenticationReducer,
  modals: modalReducer,
  market: marketReducer,
  preference: preferenceReducer
});

export { rootPersistConfig, rootReducer };
