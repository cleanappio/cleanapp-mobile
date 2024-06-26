//import AsyncStorage from '@react-native-community/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStore, applyMiddleware, compose} from 'redux';
import {persistStore, persistReducer} from 'redux-persist'; // Imports: Redux
import thunk from 'redux-thunk';
import {logger} from 'redux-logger';
import rootReducer from '../reducers/index.js'; // Middleware: Redux Persist Config

const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  blacklist: ['web3', 'reducers'],
};

// Redux: Store
const store = createStore(
  persistReducer(persistConfig, rootReducer),
  // applyMiddleware(logger, thunk),
);

// Middleware: Redux Persist Persister
let persistor = persistStore(store);

export {store, persistor};
