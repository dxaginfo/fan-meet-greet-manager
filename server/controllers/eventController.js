const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const io = require('../index').io;

// Configure AWS S3
let s3;
if (process.env.NODE_ENV === 'production') {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
} else {
  // For local development with MinIO
  s3 = new AWS.S3({
    endpoint: process.env.MINIO_ENDPOINT || 'http://minio:9000',
    accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
  });
}

// Configure multer for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || 'fan-meet-greet',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const extension = file.mimetype.split('/')[1];
      cb(null, `events/${uuid.v4()}.${extension}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Get all events
exports.getEvents = async (req, res, next) => {
  try {
    const { 
      status, 
      date, 
      search, 
      organizerId,
      upcoming,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    // Build where conditions
    let whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (date) {
      const parsedDate = new Date(date);
      whereConditions.eventDate = {
        gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
        lt: new Date(parsedDate.setHours(23, 59, 59, 999)),
      };
    }
    
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (organizerId) {
      whereConditions.organizerId = organizerId;
    }
    
    if (upcoming === 'true') {
      whereConditions.eventDate = {
        gte: new Date(),
      };
      whereConditions.status = 'PUBLISHED';
    }
    
    // Query for events
    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where: whereConditions,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              registrations: true,
              timeSlots: true,
            },
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({
        where: whereConditions,
      }),
    ]);
    
    res.status(200).json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalEvents,
        totalPages: Math.ceil(totalEvents / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single event
exports.getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        timeSlots: {
          orderBy: {
            startTime: 'asc',
          },
          include: {
            _count: {
              select: {
                registrations: true,
              },
            },
            staff: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// Create event
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      venue,
      capacity,
      isVirtual,
      meetingLink,
      meetingDuration,
      registrationDeadline,
    } = req.body;
    
    // Format dates
    const formattedEventDate = new Date(eventDate);
    const formattedStartTime = new Date(startTime);
    const formattedEndTime = new Date(endTime);
    const formattedRegistrationDeadline = new Date(registrationDeadline);
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: formattedEventDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        location,
        venue,
        capacity: parseInt(capacity),
        status: 'DRAFT',
        isVirtual: isVirtual === true || isVirtual === 'true',
        meetingLink,
        meetingDuration: meetingDuration ? parseInt(meetingDuration) : 5,
        registrationDeadline: formattedRegistrationDeadline,
        organizer: {
          connect: { id: req.user.id },
        },
        createdBy: {
          connect: { id: req.user.id },
        },
      },
    });
    
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    
    // Check if event exists
    const eventExists = await prisma.event.findUnique({
      where: { id },
      select: { id: true, organizerId: true, status: true },
    });
    
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is authorized
    if (eventExists.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    
    // Format data for update
    const updateData = {};
    
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.venue) updateData.venue = req.body.venue;
    if (req.body.capacity) updateData.capacity = parseInt(req.body.capacity);
    if (req.body.isVirtual !== undefined) updateData.isVirtual = req.body.isVirtual === true || req.body.isVirtual === 'true';
    if (req.body.meetingLink) updateData.meetingLink = req.body.meetingLink;
    if (req.body.meetingDuration) updateData.meetingDuration = parseInt(req.body.meetingDuration);
    if (req.body.status && ['DRAFT', 'PUBLISHED', 'CANCELED', 'COMPLETED'].includes(req.body.status)) {
      updateData.status = req.body.status;
    }
    
    // Parse dates if provided
    if (req.body.eventDate) updateData.eventDate = new Date(req.body.eventDate);
    if (req.body.startTime) updateData.startTime = new Date(req.body.startTime);
    if (req.body.endTime) updateData.endTime = new Date(req.body.endTime);
    if (req.body.registrationDeadline) updateData.registrationDeadline = new Date(req.body.registrationDeadline);
    
    // Perform update
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Emit event update via Socket.io
    io.to(`event-${id}`).emit('event-updated', updatedEvent);
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, organizerId: true, title: true },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    // Delete event
    await prisma.event.delete({
      where: { id },
    });
    
    // Emit event deletion via Socket.io
    io.emit('event-deleted', { id, title: event.title });
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload event image
exports.uploadEventImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Set up single file upload middleware
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      // Check if event exists
      const event = await prisma.event.findUnique({
        where: { id },
        select: { id: true, organizerId: true, imageUrl: true },
      });
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // Check if user is authorized
      if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to update this event' });
      }
      
      // Update event with image URL
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          imageUrl: req.file.location,
        },
      });
      
      res.status(200).json({ 
        message: 'Event image uploaded successfully',
        imageUrl: req.file.location,
        event: updatedEvent
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get event registrations
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    // Check if event exists
    const eventExists = await prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Build where conditions
    let whereConditions = { eventId: id };
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Get registrations
    const [registrations, totalRegistrations] = await Promise.all([
      prisma.registration.findMany({
        where: whereConditions,
        include: {
          fan: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              imageUrl: true,
              tags: true,
              eventsAttended: true,
            },
          },
          timeSlot: true,
        },
        orderBy: [
          { timeSlot: { startTime: 'asc' } },
          { registrationDate: 'asc' },
        ],
        skip,
        take: parseInt(limit),
      }),
      prisma.registration.count({
        where: whereConditions,
      }),
    ]);
    
    res.status(200).json({
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRegistrations,
        totalPages: Math.ceil(totalRegistrations / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate event time slots
exports.generateTimeSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      slotDuration,
      startTime,
      endTime,
      breakTimes,
      maxCapacityPerSlot
    } = req.body;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        organizerId: true,
        startTime: true,
        endTime: true,
        meetingDuration: true
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to manage this event' });
    }
    
    // Parse input parameters
    const duration = parseInt(slotDuration) || event.meetingDuration || 5; // in minutes
    const start = startTime ? new Date(startTime) : new Date(event.startTime);
    const end = endTime ? new Date(endTime) : new Date(event.endTime);
    const maxCapacity = parseInt(maxCapacityPerSlot) || 1;
    
    // Convert break times to Date objects if provided
    const parsedBreakTimes = [];
    if (breakTimes && Array.isArray(breakTimes)) {
      for (const breakTime of breakTimes) {
        if (breakTime.start && breakTime.end) {
          parsedBreakTimes.push({
            start: new Date(breakTime.start),
            end: new Date(breakTime.end),
          });
        }
      }
    }
    
    // Generate time slots
    const timeSlots = [];
    let currentTime = new Date(start);
    
    while (currentTime < end) {
      // Check if current time falls within a break
      const isBreakTime = parsedBreakTimes.some(breakTime => 
        currentTime >= breakTime.start && currentTime < breakTime.end
      );
      
      if (!isBreakTime) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);
        
        // Only add the slot if it ends before the event end time
        if (slotEndTime <= end) {
          timeSlots.push({
            startTime: new Date(currentTime),
            endTime: slotEndTime,
            maxCapacity,
            status: 'AVAILABLE',
            eventId: id,
          });
        }
      }
      
      // Move to the next time slot
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    
    // Create time slots in the database
    const createdTimeSlots = await prisma.$transaction(
      timeSlots.map(slot => 
        prisma.timeSlot.create({
          data: slot,
        })
      )
    );
    
    res.status(201).json({
      message: `${createdTimeSlots.length} time slots generated successfully`,
      timeSlots: createdTimeSlots,
    });
  } catch (error) {
    next(error);
  }
};

// Publish event
exports.publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: { 
        id: true, 
        organizerId: true, 
        status: true,
        title: true
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to publish this event' });
    }
    
    if (event.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Event is already published' });
    }
    
    // Update event status to published
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Emit event publish via Socket.io
    io.emit('event-published', {
      id: updatedEvent.id,
      title: updatedEvent.title,
      organizer: updatedEvent.organizer.name,
    });
    
    res.status(200).json({
      message: 'Event published successfully',
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel event
exports.cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: { 
        id: true, 
        organizerId: true, 
        status: true,
        title: true
      },
      include: {
        registrations: {
          select: {
            id: true,
            fanId: true,
            status: true,
          },
        },
      },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is authorized
    if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to cancel this event' });
    }
    
    if (event.status === 'CANCELED') {
      return res.status(400).json({ error: 'Event is already canceled' });
    }
    
    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update event status to canceled
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          status: 'CANCELED',
        },
      });
      
      // Cancel all registrations
      if (event.registrations.length > 0) {
        await prisma.registration.updateMany({
          where: { 
            eventId: id,
            status: { in: ['REGISTERED', 'CHECKED_IN'] }
          },
          data: {
            status: 'CANCELED',
          },
        });
      }
      
      // Create notifications for all registered fans
      const notifications = event.registrations.map(registration => ({
        type: 'EVENT_CANCELED',
        title: 'Event Canceled',
        message: `The event "${event.title}" has been canceled. ${cancellationReason ? `Reason: ${cancellationReason}` : ''}`,
        recipientId: registration.fanId,
        entityType: 'event',
        entityId: id,
        data: { eventTitle: event.title, cancellationReason },
      }));
      
      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }
      
      return updatedEvent;
    });
    
    // Emit event cancellation via Socket.io
    io.emit('event-canceled', {
      id: result.id,
      title: event.title,
      cancellationReason,
    });
    
    res.status(200).json({
      message: 'Event canceled successfully',
      event: result,
    });
  } catch (error) {
    next(error);
  }
};

// Event validation middleware
exports.validateEvent = [
  // Add your validation middleware here
];