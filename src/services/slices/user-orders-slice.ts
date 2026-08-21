import { createAction, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';
import type { TWsActionTypes } from '../middleware/socket-middleware';

const WS_USER_ORDERS_CONNECT = 'userOrders/wsConnect';
const WS_USER_ORDERS_DISCONNECT = 'userOrders/wsDisconnect';
const WS_USER_ORDERS_OPEN = 'userOrders/wsOpen';
const WS_USER_ORDERS_CLOSE = 'userOrders/wsClose';
const WS_USER_ORDERS_ERROR = 'userOrders/wsError';
const WS_USER_ORDERS_MESSAGE = 'userOrders/wsMessage';

export const userOrdersWsActions: TWsActionTypes = {
  connect: WS_USER_ORDERS_CONNECT,
  disconnect: WS_USER_ORDERS_DISCONNECT,
  onOpen: WS_USER_ORDERS_OPEN,
  onClose: WS_USER_ORDERS_CLOSE,
  onError: WS_USER_ORDERS_ERROR,
  onMessage: WS_USER_ORDERS_MESSAGE
};

export const userOrdersConnect = (url: string) => ({
  type: WS_USER_ORDERS_CONNECT,
  payload: url
});
export const userOrdersDisconnect = () => ({
  type: WS_USER_ORDERS_DISCONNECT
});

type TUserOrdersMessage = {
  success: boolean;
  orders: TOrder[];
};

const userOrdersWsOpen = createAction(WS_USER_ORDERS_OPEN);
const userOrdersWsClose = createAction(WS_USER_ORDERS_CLOSE);
const userOrdersWsError = createAction<string>(WS_USER_ORDERS_ERROR);
const userOrdersWsMessage = createAction<TUserOrdersMessage>(
  WS_USER_ORDERS_MESSAGE
);

type TUserOrdersState = {
  orders: TOrder[];
  isConnected: boolean;
  error: string | null;
};

const initialState: TUserOrdersState = {
  orders: [],
  isConnected: false,
  error: null
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userOrdersWsOpen, (state) => {
        state.isConnected = true;
        state.error = null;
      })
      .addCase(userOrdersWsClose, (state) => {
        state.isConnected = false;
      })
      .addCase(userOrdersWsError, (state, action) => {
        state.error = action.payload;
      })
      .addCase(userOrdersWsMessage, (state, action) => {
        state.orders = action.payload.orders;
      });
  }
});

export const selectUserOrders = (state: RootState) => state.userOrders.orders;

export default userOrdersSlice.reducer;
