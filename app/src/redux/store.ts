import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import appReducer from "./appSlice";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";
import { baseApi } from "./queries/baseApi";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    notifications: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
