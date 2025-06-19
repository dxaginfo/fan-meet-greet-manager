import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Chip, 
  TextField, 
  InputAdornment, 
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Pagination,
  CircularProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchEvents, deleteEvent, clearEventError, setEventFilter } from '../../store/slices/eventSlice';

// Custom status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  let label = status;

  switch (status) {
    case 'DRAFT':
      color = 'default';
      break;
    case 'PUBLISHED':
      color = 'success';
      break;
    case 'CANCELED':
      color = 'error';
      break;
    case 'COMPLETED':
      color = 'info';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip size="small" color={color} label={label.toLowerCase()} />
  );
};

const EventList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, isLoading, error } = useSelector(state => state.events);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');

  // Fetch events on component mount
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Handle search
  const handleSearch = () => {
    dispatch(setEventFilter({ query: searchTerm }));
    dispatch(fetchEvents());
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    dispatch(setEventFilter({ status: event.target.value }));
    dispatch(fetchEvents());
  };

  // Handle date filter change
  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    dispatch(setEventFilter({ date: event.target.value }));
    dispatch(fetchEvents());
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    dispatch(clearEventError());
    dispatch(setEventFilter({ status: null, date: null, query: null }));
    dispatch(fetchEvents());
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Update API call with pagination
  };

  // Navigate to event creation
  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  // Navigate to event details
  const handleViewEvent = (id) => {
    navigate(`/events/${id}`);
  };

  // Navigate to event edit
  const handleEditEvent = (id) => {
    navigate(`/events/${id}/edit`);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (id, title) => {
    setSelectedEventId(id);
    setSelectedEventTitle(title);
    setOpenDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedEventId) {
      dispatch(deleteEvent(selectedEventId))
        .unwrap()
        .then(() => {
          setOpenDeleteDialog(false);
          setSelectedEventId(null);
          setSelectedEventTitle('');
        })
        .catch((error) => {
          console.error('Failed to delete event:', error);
        });
    }
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedEventId(null);
    setSelectedEventTitle('');
  };

  // Navigate to event registrations
  const handleViewRegistrations = (id) => {
    navigate(`/events/${id}/registrations`);
  };

  // Navigate to event schedule
  const handleViewSchedule = (id) => {
    navigate(`/events/${id}/schedule`);
  };

  // Format event date for display
  const formatEventDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP'); // e.g., April 29, 2023
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format event time for display
  const formatEventTime = (dateString) => {
    try {
      return format(new Date(dateString), 'p'); // e.g., 12:00 PM
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meet & Greet Events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      {/* Search and filter section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} size="small">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={statusFilter}
                onChange={handleStatusFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="CANCELED">Canceled</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No events message */}
      {!isLoading && events.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first meet & greet event to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEvent}
          >
            Create Event
          </Button>
        </Box>
      )}

      {/* Event list */}
      {!isLoading && events.length > 0 && (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                {/* Card media - show event image or default background */}
                <Box 
                  sx={{ 
                    height: 140,
                    position: 'relative',
                    bgcolor: event.imageUrl ? 'transparent' : 'primary.main',
                    backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Status chip */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <StatusChip status={event.status} />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom noWrap>
                    {event.title}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatEventDate(event.eventDate)}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {event.location}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {event._count?.registrations || 0} / {event.capacity} registrations
                    </Typography>
                  </Box>
                  
                  {event.isVirtual && (
                    <Chip
                      size="small"
                      label="Virtual"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewEvent(event.id)}
                      >
                        View
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditEvent(event.id)}
                      >
                        Edit
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(event.id, event.title)}
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!isLoading && events.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={10} // Replace with actual page count
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEventTitle}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventList;