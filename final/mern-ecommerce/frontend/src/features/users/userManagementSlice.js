import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { getErrorMessage } from '../../utils/axiosConfig';

export const fetchUsers = createAsyncThunk('userManagement/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get('/users');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const deleteUserAdmin = createAsyncThunk(
  'userManagement/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserAdmin = createAsyncThunk(
  'userManagement/update',
  async ({ id, userData }, thunkAPI) => {
    try {
      const { data } = await axios.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserAdmin.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(updateUserAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u
        );
      });
  },
});

export default userManagementSlice.reducer;
