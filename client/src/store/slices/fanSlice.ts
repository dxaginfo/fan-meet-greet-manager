import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Fan {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  city?: string;
  state?: string;
  country?: string;
  socialHandles?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  fanClubMemberId?: string;
  registrationDate: string;
  tags?: string[];
  imageUrl?: string;
  notes?: string;
  status: 'active' | 'blocked' | 'pending';
  eventsAttended: number;
  lastAttendance?: string;
}

export interface Registration {
  id: string;
  fanId: string;
  eventId: string;
  status: 'registered' | 'checked_in' | 'completed' | 'canceled' | 'no_show';
  registrationDate: string;
  checkInTime?: string;
  completionTime?: string;
  specialRequests?: string;
  fan: Fan;
  event: {
    id: string;
    title: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

interface FansState {
  fans: Fan[];
  currentFan: Fan | null;
  registrations: Registration[];
  currentRegistration: Registration | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    status: string | null;
    query: string | null;
    eventId: string | null;
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks for Fans
export const fetchFans = createAsyncThunk(
  'fans/fetchFans',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/fans`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fans');
    }
  }
);

export const fetchFanById = createAsyncThunk(
  'fans/fetchFanById',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/fans/${id}`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fan');
    }
  }
);

export const createFan = createAsyncThunk(
  'fans/createFan',
  async (fanData: Partial<Fan>, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/fans`, fanData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create fan');
    }
  }
);

export const updateFan = createAsyncThunk(
  'fans/updateFan',
  async ({ id, fanData }: { id: string, fanData: Partial<Fan> }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/fans/${id}`, fanData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update fan');
    }
  }
);

export const deleteFan = createAsyncThunk(
  'fans/deleteFan',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      await axios.delete(`${API_URL}/fans/${id}`, config);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete fan');
    }
  }
);

// Async thunks for Registrations
export const fetchRegistrations = createAsyncThunk(
  'fans/fetchRegistrations',
  async (eventId?: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const url = eventId 
        ? `${API_URL}/events/${eventId}/registrations` 
        : `${API_URL}/registrations`;
      
      const response = await axios.get(url, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registrations');
    }
  }
);

export const fetchRegistrationById = createAsyncThunk(
  'fans/fetchRegistrationById',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/registrations/${id}`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registration');
    }
  }
);

export const createRegistration = createAsyncThunk(
  'fans/createRegistration',
  async (registrationData: { fanId: string; eventId: string; timeSlotId?: string; specialRequests?: string }, 
    { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/registrations`, registrationData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create registration');
    }
  }
);

export const updateRegistration = createAsyncThunk(
  'fans/updateRegistration',
  async ({ id, registrationData }: { 
    id: string, 
    registrationData: { 
      status?: string; 
      timeSlotId?: string; 
      specialRequests?: string 
    } 
  }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/registrations/${id}`, registrationData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update registration');
    }
  }
);

export const checkInRegistration = createAsyncThunk(
  'fans/checkInRegistration',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/registrations/${id}/check-in`, {}, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in registration');
    }
  }
);

export const completeRegistration = createAsyncThunk(
  'fans/completeRegistration',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/registrations/${id}/complete`, {}, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete registration');
    }
  }
);

export const cancelRegistration = createAsyncThunk(
  'fans/cancelRegistration',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/registrations/${id}/cancel`, {}, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel registration');
    }
  }
);

const initialState: FansState = {
  fans: [],
  currentFan: null,
  registrations: [],
  currentRegistration: null,
  isLoading: false,
  error: null,
  filter: {
    status: null,
    query: null,
    eventId: null
  }
};

const fansSlice = createSlice({
  name: 'fans',
  initialState,
  reducers: {
    clearFanError(state) {
      state.error = null;
    },
    clearCurrentFan(state) {
      state.currentFan = null;
    },
    clearCurrentRegistration(state) {
      state.currentRegistration = null;
    },
    setFanFilter(state, action: PayloadAction<{ status?: string | null; query?: string | null; eventId?: string | null }>) {
      state.filter = {
        ...state.filter,
        ...action.payload
      };
    },
    clearFanFilters(state) {
      state.filter = {
        status: null,
        query: null,
        eventId: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch fans
      .addCase(fetchFans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fans = action.payload;
      })
      .addCase(fetchFans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch fan by id
      .addCase(fetchFanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFan = action.payload;
      })
      .addCase(fetchFanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create fan
      .addCase(createFan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fans.push(action.payload);
        state.currentFan = action.payload;
      })
      .addCase(createFan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update fan
      .addCase(updateFan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFan.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.fans.findIndex(fan => fan.id === action.payload.id);
        if (index !== -1) {
          state.fans[index] = action.payload;
        }
        state.currentFan = action.payload;
      })
      .addCase(updateFan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete fan
      .addCase(deleteFan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fans = state.fans.filter(fan => fan.id !== action.payload);
        if (state.currentFan && state.currentFan.id === action.payload) {
          state.currentFan = null;
        }
      })
      .addCase(deleteFan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch registrations
      .addCase(fetchRegistrations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch registration by id
      .addCase(fetchRegistrationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegistrationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRegistration = action.payload;
      })
      .addCase(fetchRegistrationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create registration
      .addCase(createRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations.push(action.payload);
        state.currentRegistration = action.payload;
      })
      .addCase(createRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update registration
      .addCase(updateRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id);
        if (index !== -1) {
          state.registrations[index] = action.payload;
        }
        state.currentRegistration = action.payload;
      })
      .addCase(updateRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Check in registration
      .addCase(checkInRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkInRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id);
        if (index !== -1) {
          state.registrations[index] = action.payload;
        }
        if (state.currentRegistration && state.currentRegistration.id === action.payload.id) {
          state.currentRegistration = action.payload;
        }
      })
      .addCase(checkInRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Complete registration
      .addCase(completeRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id);
        if (index !== -1) {
          state.registrations[index] = action.payload;
        }
        if (state.currentRegistration && state.currentRegistration.id === action.payload.id) {
          state.currentRegistration = action.payload;
        }
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Cancel registration
      .addCase(cancelRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registrations.findIndex(reg => reg.id === action.payload.id);
        if (index !== -1) {
          state.registrations[index] = action.payload;
        }
        if (state.currentRegistration && state.currentRegistration.id === action.payload.id) {
          state.currentRegistration = action.payload;
        }
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  clearFanError, 
  clearCurrentFan, 
  clearCurrentRegistration, 
  setFanFilter, 
  clearFanFilters 
} = fansSlice.actions;

export default fansSlice.reducer;