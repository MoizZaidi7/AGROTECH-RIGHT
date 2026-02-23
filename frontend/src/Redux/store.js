import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import authReducer from './authslice.js'; // Replace with the correct path to your auth slice

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Specify the reducers you want to persist
};

// Combine reducers if you have multiple slices
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here as your app grows
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable warnings for non-serializable values (e.g., functions)
    }),
});

const persistor = persistStore(store);

export { store, persistor };