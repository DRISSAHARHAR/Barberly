import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LoginData, RegisterData, authApi } from '../../api/auth.api';

interface User {
  id: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  isVerified: boolean;
  profile?: unknown;
  barberProfile?: unknown;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempUserId: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tempUserId: null
};

export const register = createAsyncThunk('auth/register', async (data: RegisterData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Erreur d'inscription");
  }
});

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ userId, code }: { userId: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOTP(userId, code);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Code invalide');
    }
  }
);

export const resendOTP = createAsyncThunk('auth/resendOTP', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await authApi.resendOTP(userId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Erreur d'envoi OTP");
  }
});

export const login = createAsyncThunk('auth/login', async (data: LoginData, { rejectWithValue }) => {
  try {
    const response = await authApi.login(data);
    const { user, tokens } = response.data;

    await AsyncStorage.setItem('accessToken', tokens.accessToken);
    await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return { user, tokens };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Erreur de connexion');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    return null;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Erreur de déconnexion');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (userJson && accessToken) {
      return { user: JSON.parse(userJson), accessToken };
    }

    return null;
  } catch (_error) {
    return rejectWithValue('Erreur de chargement');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTempUser: (state) => {
      state.tempUserId = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tempUserId = action.payload.userId;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(verifyOTP.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(verifyOTP.fulfilled, (state) => {
      state.isLoading = false;
      state.tempUserId = null;
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });

    builder.addCase(loadUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    });
  }
});

export const { clearError, clearTempUser } = authSlice.actions;
export default authSlice.reducer;
