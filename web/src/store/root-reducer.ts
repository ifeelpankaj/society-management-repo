import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/auth-slice";
import { generatedApi } from "@/lib/api/generated-api";

export const rootReducer = combineReducers({
  auth: authReducer,
  [generatedApi.reducerPath]: generatedApi.reducer,
});
