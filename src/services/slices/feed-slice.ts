import { createAction, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';
import type { TWsActionTypes } from '../middleware/socket-middleware';

const WS_FEED_CONNECT = 'feed/wsConnect';
const WS_FEED_DISCONNECT = 'feed/wsDisconnect';
const WS_FEED_OPEN = 'feed/wsOpen';
const WS_FEED_CLOSE = 'feed/wsClose';
const WS_FEED_ERROR = 'feed/wsError';
const WS_FEED_MESSAGE = 'feed/wsMessage';

export const feedWsActions: TWsActionTypes = {
  connect: WS_FEED_CONNECT,
  disconnect: WS_FEED_DISCONNECT,
  onOpen: WS_FEED_OPEN,
  onClose: WS_FEED_CLOSE,
  onError: WS_FEED_ERROR,
  onMessage: WS_FEED_MESSAGE
};

export const feedConnect = (url: string) => ({
  type: WS_FEED_CONNECT,
  payload: url
});
export const feedDisconnect = () => ({ type: WS_FEED_DISCONNECT });

type TFeedMessage = {
  success: boolean;
  orders: TOrder[];
  total: number;
  totalToday: number;
};

const feedWsOpen = createAction(WS_FEED_OPEN);
const feedWsClose = createAction(WS_FEED_CLOSE);
const feedWsError = createAction<string>(WS_FEED_ERROR);
const feedWsMessage = createAction<TFeedMessage>(WS_FEED_MESSAGE);

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isConnected: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isConnected: false,
  error: null
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(feedWsOpen, (state) => {
        state.isConnected = true;
        state.error = null;
      })
      .addCase(feedWsClose, (state) => {
        state.isConnected = false;
      })
      .addCase(feedWsError, (state, action) => {
        state.error = action.payload;
      })
      .addCase(feedWsMessage, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      });
  }
});

export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedTotal = (state: RootState) => state.feed.total;
export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;

export default feedSlice.reducer;
