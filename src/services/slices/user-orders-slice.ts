import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';

export const getUserOrders = createAsyncThunk(
  'userOrders/getOrders',
  getOrdersApi
);

type TUserOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null | undefined;
};

const initialState: TUserOrdersState = {
  orders: [],
  isLoading: false,
  error: null
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const selectUserOrders = (state: RootState) => state.userOrders.orders;
export const selectUserOrdersLoading = (state: RootState) =>
  state.userOrders.isLoading;

export default userOrdersSlice.reducer;
