import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  capacity: number;
  registrationsCount: number;
  status: 'draft' | 'published' | 'canceled' | 'completed';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  organizerId: string;
  isVirtual: boolean;
  meetingDuration: number;
  meetingLink?: string;
  registrationDeadline: string;
}

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    status: string | null;
    date: string | null;
    query: string | null;
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents', 
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/events`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/events/${id}`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Partial<Event>, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/events`, eventData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: string, eventData: Partial<Event> }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(`${API_URL}/events/${id}`, eventData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      };
      
      await axios.delete(`${API_URL}/events/${id}`, config);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

export const uploadEventImage = createAsyncThunk(
  'events/uploadEventImage',
  async ({ id, imageFile }: { id: string, imageFile: File }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(`${API_URL}/events/${id}/image`, formData, config);
      return {
        id,
        imageUrl: response.data.imageUrl
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload event image');
    }
  }
);

// Initial state
const initialState: EventsState = {
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  filter: {
    status: null,
    date: null,
    query: null
  }
};

// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventError(state) {
      state.error = null;
    },
    clearCurrentEvent(state) {
      state.currentEvent = null;
    },
    setEventFilter(state, action: PayloadAction<{ status?: string | null; date?: string | null; query?: string | null }>) {
      state.filter = {
        ...state.filter,
        ...action.payload
      };
    },
    clearEventFilters(state) {
      state.filter = {
        status: null,
        date: null,
        query: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch event by id
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload);
        state.currentEvent = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.currentEvent = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        if (state.currentEvent && state.currentEvent.id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload event image
      .addCase(uploadEventImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadEventImage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, imageUrl } = action.payload;
        
        // Update event in events array
        const eventIndex = state.events.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
          state.events[eventIndex].imageUrl = imageUrl;
        }
        
        // Update current event if it's the same one
        if (state.currentEvent && state.currentEvent.id === id) {
          state.currentEvent.imageUrl = imageUrl;
        }
      })
      .addCase(uploadEventImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearEventError, clearCurrentEvent, setEventFilter, clearEventFilters } = eventsSlice.actions;

export default eventsSlice.reducer;