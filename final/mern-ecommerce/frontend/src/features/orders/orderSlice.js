import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { getErrorMessage } from '../../utils/axiosConfig';

export const createOrder = createAsyncThunk('orders/create', async (order, thunkAPI) => {
  try {
    const { data } = await axios.post('/orders', order);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (id, thunkAPI) => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const payOrder = createAsyncThunk('orders/pay', async (orderId, thunkAPI) => {
  try {
    const { data } = await axios.put(`/orders/${orderId}/pay`, {});
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get('/orders/myorders');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

// Admin
export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get('/orders');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateOrderStatusAdmin = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const { data } = await axios.put(`/orders/${id}/status`, { status });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'orders/fetchStats',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/orders/stats');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    order: null,
    myOrders: [],
    allOrders: [],
    stats: null,
    loading: false,
    error: null,
    createSuccess: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.createSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.createSuccess = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.order = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.allOrders = state.allOrders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
