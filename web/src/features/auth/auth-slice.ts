import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "./auth-types";

type AuthState = {
  user: User | null;
};

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user;
    },
    clearAuth(state) {
      state.user = null;
    },
  },
});

export const { clearAuth, setCredentials } = authSlice.actions;

export default authSlice.reducer;
