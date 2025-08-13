# EduPortal Backend API

A comprehensive MERN stack student portal backend with MongoDB Atlas integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Students, Instructors, and Admins with complete profiles
- **Course Management**: Full course lifecycle with enrollment system
- **Assignment System**: Multiple assignment types with file upload support
- **Grading System**: Comprehensive grading with GPA calculation
- **Announcements**: Priority-based notification system
- **Real-time Features**: Socket.io integration for live updates
- **Email Notifications**: Automated email system for important events
- **File Upload**: Secure file handling with validation
- **Security**: Rate limiting, CORS, XSS protection, and more

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your MongoDB Atlas connection string and other settings:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_portal
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

5. **Seed the Database**
   ```bash
   npm run seed
   ```

6. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | User logout | Private |

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/courses` | Get all courses | Public |
| GET | `/api/courses/:id` | Get single course | Public |
| POST | `/api/courses` | Create course | Instructor/Admin |
| PUT | `/api/courses/:id` | Update course | Instructor/Admin |
| DELETE | `/api/courses/:id` | Delete course | Instructor/Admin |
| POST | `/api/courses/:id/enroll` | Enroll in course | Student |
| POST | `/api/courses/:id/drop` | Drop course | Student |
| GET | `/api/courses/enrolled/my` | Get enrolled courses | Student |
| GET | `/api/courses/instructor/my` | Get instructor courses | Instructor |

### Assignment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/assignments` | Get assignments | Private |
| GET | `/api/assignments/:id` | Get single assignment | Private |
| POST | `/api/assignments` | Create assignment | Instructor/Admin |
| PUT | `/api/assignments/:id` | Update assignment | Instructor/Admin |
| DELETE | `/api/assignments/:id` | Delete assignment | Instructor/Admin |
| POST | `/api/assignments/:id/submit` | Submit assignment | Student |
| POST | `/api/assignments/:id/grade/:studentId` | Grade submission | Instructor/Admin |
| GET | `/api/assignments/upcoming` | Get upcoming assignments | Student |

### Grade Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/grades` | Get grades | Private |
| GET | `/api/grades/:id` | Get single grade | Private |
| PUT | `/api/grades/:id` | Update grade | Instructor/Admin |
| POST | `/api/grades/:id/comments` | Add grade comment | Private |
| POST | `/api/grades/:id/flag` | Flag grade for review | Student |
| GET | `/api/grades/statistics` | Get grade statistics | Private |
| GET | `/api/grades/gpa/:studentId?` | Calculate GPA | Private |

### Announcement Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/announcements` | Get announcements | Private |
| GET | `/api/announcements/:id` | Get single announcement | Private |
| POST | `/api/announcements` | Create announcement | Instructor/Admin |
| PUT | `/api/announcements/:id` | Update announcement | Instructor/Admin |
| DELETE | `/api/announcements/:id` | Delete announcement | Instructor/Admin |
| POST | `/api/announcements/:id/read` | Mark as read | Private |
| POST | `/api/announcements/:id/pin` | Pin/Unpin announcement | Instructor/Admin |
| POST | `/api/announcements/:id/comments` | Add comment | Private |
| GET | `/api/announcements/recent` | Get recent announcements | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin/Own |
| PUT | `/api/users/:id` | Update user | Admin/Own |
| DELETE | `/api/users/:id` | Deactivate user | Admin |
| GET | `/api/users/statistics` | Get user statistics | Admin |

## 🔐 Demo Credentials

```javascript
// Admin
{
  email: "admin@university.edu",
  password: "admin123"
}

// Instructor
{
  email: "michael.johnson@university.edu",
  password: "instructor123"
}

// Student
{
  email: "john.smith@student.edu",
  password: "student123"
}
```

## 🏗️ Database Schema

### User Model
- Personal information (name, email, phone, address)
- Role-based fields (student/instructor/admin)
- Academic information (GPA, enrolled courses)
- Authentication data (password, tokens)

### Course Model
- Course details (code, title, description, credits)
- Schedule information (days, times, location)
- Enrollment management
- Prerequisites and materials

### Assignment Model
- Assignment details (title, description, type, points)
- Due dates and submission settings
- File attachments support
- Rubric and grading criteria

### Grade Model
- Grade records with automatic calculations
- Feedback and comments system
- Rubric scoring
- GPA calculation support

### Announcement Model
- Priority-based announcements
- Target audience filtering
- Comment system
- Read tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `EMAIL_HOST` | SMTP host for emails | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization
- **File Upload Validation**: Type and size restrictions
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── courseController.js  # Course management
│   │   ├── assignmentController.js # Assignment handling
│   │   ├── gradeController.js   # Grade management
│   │   └── announcementController.js # Announcements
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── validation.js       # Input validation
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Course.js           # Course schema
│   │   ├── Assignment.js       # Assignment schema
│   │   ├── Grade.js            # Grade schema
│   │   └── Announcement.js     # Announcement schema
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── courses.js          # Course routes
│   │   ├── assignments.js      # Assignment routes
│   │   ├── grades.js           # Grade routes
│   │   ├── announcements.js    # Announcement routes
│   │   └── users.js            # User routes
│   ├── scripts/
│   │   └── seedData.js         # Database seeding
│   ├── utils/
│   │   └── email.js            # Email utilities
│   └── server.js               # Main server file
├── uploads/                    # File uploads directory
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Setup

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Configure production database**
   ```env
   MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/student_portal_prod
   ```

3. **Set secure JWT secret**
   ```env
   JWT_SECRET=your_super_secure_production_secret_key_here
   ```

4. **Configure email service**
   ```env
   EMAIL_HOST=your-smtp-host.com
   EMAIL_USER=your-email@domain.com
   EMAIL_PASS=your-app-password
   ```

### Deployment Platforms

- **Heroku**: Ready for Heroku deployment
- **Railway**: Compatible with Railway
- **DigitalOcean**: App Platform ready
- **AWS**: EC2 or Elastic Beanstalk
- **Vercel**: Serverless functions (with modifications)

## 📊 Monitoring

The server includes comprehensive logging and error tracking:

- Request/Response logging with Morgan
- Error handling with stack traces in development
- Database connection monitoring
- Real-time Socket.io connection tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo credentials and test the API endpoints

## 🔄 Version History

- **v1.0.0**: Initial release with full CRUD operations
- **v1.1.0**: Added real-time features with Socket.io
- **v1.2.0**: Enhanced security and validation
- **v1.3.0**: Email notification system
- **v1.4.0**: File upload support
- **v1.5.0**: Advanced grading and GPA calculation