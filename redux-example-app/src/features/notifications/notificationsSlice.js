import {
  createAction,
  createEntityAdapter, createSelector,
  createSlice, isAnyOf
} from "@reduxjs/toolkit";
import {apiSlice} from "../api/apiSlice";
import {forceGenerateNotifications} from "../../api/server";

const notificationsReceived = createAction(
  'notifications/notificationsReceived'
);

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query({
      query: () => "/notifications",
      async onCacheEntryAdded(
        arg,
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch}
      ) {
        const ws = new WebSocket("ws://localhost");
        try {
          await cacheDataLoaded;

          const listener = event => {
            const message = JSON.parse(event.data);
            switch (message.type) {
              case "notifications": {
                updateCachedData(draft => {
                  draft.push(...message.payload);
                  draft.sort((a, b) => b.date.localeCompare(a.date));
                });
                dispatch(notificationsReceived(message.payload));
                break;
              }
              default:
                break
            }
          }
          ws.addEventListener("message", listener);
        } catch {
        }
        await cacheEntryRemoved;
        ws.close();
      }
    })
  })
});

export const {useGetNotificationsQuery} = extendedApi;

const emptyNotifications = [];

export const selectNotificationsResult =
  extendedApi.endpoints.getNotifications.select();

const selectNotificationsData = createSelector(
  selectNotificationsResult,
  notificationResult => notificationResult.data ?? emptyNotifications
);

export const fetchNotificationsWebsocket = () => (dispatch, getState) => {
  const allNotifications = selectNotificationsData(getState());
  // 分割代入: 配列の先頭の要素を取り出している > 配列は最新順 > 最新の通知が渡される
  const [latestNotification] = allNotifications;
  // 要素が渡されていればその日時以降の通知を取りに行く
  const latestTimestamp = latestNotification?.data ?? "";
  forceGenerateNotifications(latestTimestamp);
};

const notificationsAdapter = createEntityAdapter();

const matchNotificationsReceived = isAnyOf(
  notificationsReceived,
  extendedApi.endpoints.getNotifications.matchFulfilled
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
    builder.addMatcher(matchNotificationsReceived, (state, action) => {
      const notificationsMetadata = action.payload.map(notification => ({
        id: notification.id,
        read: false,
        isNew: true
      }));

      Object.values(state.entities).forEach(notification => {
        notification.isNew = !notification.read;
      });

      notificationsAdapter.upsertMany(state, notificationsMetadata);
    })
  }
});

export const {allNotificationsRead} = notificationSlice.actions;

export default notificationSlice.reducer;

export const {
  selectAll: selectNotificationsMetadata,
  selectEntities: selectMetadataEntities
} = notificationsAdapter.getSelectors(state => state.notifications);
