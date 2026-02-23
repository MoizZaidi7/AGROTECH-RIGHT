import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    switchProfile: (state, action) => {
      if (state.user) {
        state.user.userType = action.payload.userType;
      }
    },
  },
});

export const { login, logout, switchProfile } = authSlice.actions;
export default authSlice.reducer;