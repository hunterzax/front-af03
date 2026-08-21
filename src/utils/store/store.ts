// store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './slices/rootReducer';
// import { persistStore, persistReducer } from "redux-persist";
import { persistStore, persistReducer } from 'redux-persist'; // PersistPartial here
import storage from "redux-persist/lib/storage";
import { useDispatch } from 'react-redux';

// import { PersistPartial } from 'redux-persist/lib/persistReducer';

const persistConfig = {
  key: "root",
  storage,
  // whitelist: ["examplePersistReducer"],
};

// const isClient = typeof window !== 'undefined';
// const persistedReducer = persistReducer(persistConfig, rootReducer);
// const persistedReducer = isClient ? persistReducer(persistConfig, rootReducer) : rootReducer;

const store = configureStore({
  // reducer: rootReducer,
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
// export const persistor = isClient ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
// export type RootState = ReturnType<typeof store.getState> & PersistPartial;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;