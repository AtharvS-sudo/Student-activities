# Student Activities Management System

A comprehensive web-based platform for managing academic and club activities in educational institutions.

## Features

- **User Authentication & Authorization** - Secure login with role-based access control
- **Notice Management** - Create, edit, and manage academic and club notices
- **Club Application System** - Students can apply to clubs with automated approval workflow
- **Department-Specific Content** - Students see only relevant academic notices
- **Club Management** - Club heads can manage applications and members
- **Admin Panel** - Complete system administration and user management

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Multer (file uploads)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_activities2
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## User Roles

- **Student** - View notices, apply to clubs, manage profile
- **Faculty** - Create and manage notices (with @vit.edu email)
- **Club Head** - Manage club applications and members
- **Admin** - Full system access and user management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Club Applications
- `GET /api/club-applications/my-applications` - Get user's applications
- `GET /api/club-applications/club-head` - Get club's applications (club head)
- `POST /api/club-applications` - Apply to club
- `PATCH /api/club-applications/:id` - Approve/reject application

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/club-members/:clubId` - Get club members
- `PUT /api/users/:id/privileges` - Update user privileges
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
student-activities/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   ├── uploads/         # Uploaded files
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   └── styles/      # CSS modules
│   └── public/
└── README.md

```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/student-activities](https://github.com/yourusername/student-activities)
