import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {client} from "../../api/client";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, {getState}) => {
    const allNotifications = selectAllNotifications(getState());
    // 分割代入: 配列の先頭の要素を取り出している > 配列は最新順 > 最新の通知が渡される
    const [latestNotification] = allNotifications;
    // 要素が渡されていればその日時以降の通知を取りに行く
    const latestTimestamp = latestNotification ? latestNotification.date : "";
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    );
    return response.data;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    allNotificationsRead(state, action) {
      state.forEach(notification => {
        notification.read = true
      });
    }
  },
  extraReducers: {
    // 新しい通知を追加して最新順にソートする
    [fetchNotifications.fulfilled]: (state, action) => {
      state.push(...action.payload);
      state.forEach(notification => {
        notification.isNew = !notification.read;
      });
      state.sort((a, b) => b.date.localeCompare(a.date));
    }
  }
});

export const {allNotificationsRead} = notificationSlice.actions;

export default notificationSlice.reducer;

export const selectAllNotifications = state => state.notifications;
