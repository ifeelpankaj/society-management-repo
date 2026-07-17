import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type NotificationState = {
  expoPushToken: string | null;
};

const initialState: NotificationState = {
  expoPushToken: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setExpoPushToken: (state, action: PayloadAction<string | null>) => {
      state.expoPushToken = action.payload;
    },
  },
});

export const { setExpoPushToken } = notificationSlice.actions;
export default notificationSlice.reducer;
