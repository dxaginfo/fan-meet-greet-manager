# Fan Meet & Greet Manager

A comprehensive web application to help musicians organize, manage, and optimize fan interaction events.

![License](https://img.shields.io/github/license/dxaginfo/fan-meet-greet-manager)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 🎭 Overview

The Fan Meet & Greet Manager streamlines the entire process of planning, scheduling, and executing fan interaction events, ensuring memorable experiences for fans while reducing administrative overhead for artists and their teams.

## ✨ Features

### Core Functionality

- **Event Management:** Create and configure meet & greet events with customizable parameters
- **Fan Registration:** Self-service registration portal with tiered access options
- **Scheduling System:** Automated time slot allocation based on artist availability
- **Check-in Management:** Digital check-in system with QR codes and real-time tracking
- **Digital Memento Creation:** Automated photo/video capture with immediate delivery
- **Communication Tools:** Automated email/SMS notifications and reminders
- **Analytics Dashboard:** Comprehensive metrics on attendance and engagement

### For Artists & Managers

- Set up meet & greet events linked to tour schedules
- Customize information collected from fans
- View daily schedules with relevant fan information
- Track success metrics across different venues
- Identify and reward most engaged fans

### For Fans

- Easy registration for events with favorite artists
- Clear instructions about event logistics
- Smooth, organized experience on event day
- Digital mementos of the experience
- Ability to share experiences on social media

### For Staff

- Efficient fan check-in process
- Real-time queue and timing monitoring
- Tools to handle special requests
- Team communication during events
- Post-event reporting for continuous improvement

## 🚀 Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material-UI for components
- Chart.js for data visualization
- FullCalendar for scheduling interface
- Formik with Yup for form validation

### Backend
- Node.js with Express
- JWT + OAuth 2.0 for authentication
- Prisma ORM for database interaction
- Socket.io for real-time features
- Multer for file processing
- Sharp for image processing

### Database
- PostgreSQL as primary database
- Redis for caching and real-time data
- Elasticsearch for search functionality

### Infrastructure
- AWS (EC2, S3, CloudFront)
- Docker with Docker Compose
- GitHub Actions for CI/CD
- Sentry for error tracking
- Datadog for performance monitoring

## 📋 System Architecture

The application follows a microservices architecture with the following components:

1. **Client Application Layer:** Web app, staff mobile interface, and public registration portal
2. **API Gateway Layer:** Request routing, rate limiting, authentication, and versioning
3. **Microservices Layer:** Event management, registration, scheduling, check-in, notifications, media processing, and analytics
4. **Data Layer:** PostgreSQL, Redis, Elasticsearch, and S3
5. **External Integration Layer:** Payment processors, communication providers, social media, calendars, and ticketing
6. **DevOps Layer:** Monitoring, CI/CD, infrastructure as code, and disaster recovery

## 💻 Development Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (or use Docker container)
- AWS account (for production deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dxaginfo/fan-meet-greet-manager.git
   cd fan-meet-greet-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development environment:
   ```bash
   # Start database and services
   docker-compose up -d
   
   # Run migrations
   npm run migrate
   
   # Start development server
   npm run dev
   ```

5. Access the application at http://localhost:3000

## 🔧 Configuration

Configuration is managed through environment variables. See `.env.example` for all available options.

Key configurations:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token generation
- `AWS_*`: AWS credentials for S3 access
- `EMAIL_*`: Email service configuration
- `SMS_*`: SMS service configuration

## 📱 Mobile Responsiveness

The application is designed to be fully responsive across all devices:

- Responsive layout adapts to any screen size
- Touch-friendly interface for mobile devices
- Optimized image loading for various bandwidth conditions
- PWA support for improved mobile experience

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control
- HTTPS enforcement
- Rate limiting to prevent abuse
- Data encryption for sensitive information
- CSRF protection
- Input validation and sanitization
- Regular security audits

## 🔌 Integrations

- **Ticketing platforms:** Integrate with existing ticketing systems
- **Payment processors:** Stripe, PayPal
- **Email services:** SendGrid
- **SMS services:** Twilio
- **Social media:** Share to major platforms
- **Calendar systems:** Google Calendar, iCal
- **Media storage:** AWS S3

## 📊 Deployment

### Development
- Local Docker environment

### Staging
- AWS EC2 with containerized services
- CI/CD pipeline via GitHub Actions

### Production
- AWS EC2 with auto-scaling
- AWS S3 for static assets and media
- AWS CloudFront as CDN
- Managed PostgreSQL and Redis
- Regular backups and disaster recovery

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

Additional documentation can be found in the [docs](docs/) directory:

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)
- [User Guide](docs/user-guide.md)