import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from "@reduxjs/toolkit";
import {client} from "../../api/client";

const notificationsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
});

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
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    allNotificationsRead(state) {
      Object.values(state.entities).forEach(notification => {
        notification.read = true;
      });
    }
  },
  extraReducers(builder) {
    // 新しい通知を追加して最新順にソートする
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      notificationsAdapter.upsertMany(state, action.payload);
      Object.values(state.entities).forEach(notification => {
        notification.isNew = !notification.read;
      });
    })
  }
});

export const {allNotificationsRead} = notificationSlice.actions;

export default notificationSlice.reducer;

export const {selectAll: selectAllNotifications} =
  notificationsAdapter.getSelectors(state => state.notifications);
