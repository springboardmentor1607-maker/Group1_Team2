# Clean Street Backend API

This backend supports a complaint management system with admin functionality for managing volunteers and complaints.

## Setup Instructions

### 1. Database Setup
First, set up your PostgreSQL database and run the schema:

```bash
# Run the database schema
psql -U your_username -d your_database -f backend/database_schema.sql
```

### 2. Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/cleanstreet_db
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Protected Routes
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Admin Only Routes
- `GET /api/auth/admin/users` - Get all users
- `PUT /api/auth/admin/users/role` - Update user role

### Complaint Routes (`/api/complaints`)

#### User Routes
- `POST /api/complaints/create` - Create new complaint
- `GET /api/complaints/user` - Get user's own complaints
- `GET /api/complaints/:id` - Get specific complaint by ID

#### Volunteer Routes
- `GET /api/complaints/volunteer` - Get complaints assigned to volunteer
- `PUT /api/complaints/status` - Update complaint status (volunteer can update assigned complaints)

#### Admin Only Routes
- `GET /api/complaints/` - Get all complaints
- `POST /api/complaints/assign` - Assign complaint to volunteer
- `GET /api/complaints/stats/overview` - Get complaint statistics
- `GET /api/complaints/admin/volunteers` - Get all volunteers

## User Roles

### 1. Citizen
- Can create complaints
- View their own complaints
- Update their profile

### 2. Volunteer
- Can view complaints assigned to them
- Can update status of assigned complaints
- Update their profile

### 3. Admin
- Can view all complaints
- Can assign complaints to volunteers
- Can view all users and volunteers
- Can update user roles
- Can view complaint statistics

## Complaint Data Structure

```javascript
{
  id: "Unique identifier for the complaint",
  user_id: "ID of the reporting user",
  title: "Short issue title",
  description: "Detailed complaint",
  photo: "Link to complaint image (optional)",
  location_coords: "GPS coordinates (JSON string)",
  address: "Physical address",
  assigned_to: "Assigned volunteer ID",
  status: "Complaint status (received, in_review, resolved)",
  created_at: "Complaint submission time",
  updated_at: "Last update time"
}
```

## Sample API Calls

### 1. Register Admin User
```javascript
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### 2. Create Complaint
```javascript
POST /api/complaints/create
Headers: { "Authorization": "Bearer token" }
{
  "title": "Broken Street Light",
  "description": "Street light is not working",
  "address": "123 Main Street",
  "location_coords": "{\"lat\": 40.7128, \"lng\": -74.0060}",
  "photo": "https://example.com/photo.jpg"
}
```

### 3. Assign Complaint to Volunteer (Admin Only)
```javascript
POST /api/complaints/assign
Headers: { "Authorization": "Bearer admin_token" }
{
  "complaint_id": 1,
  "volunteer_id": 2
}
```

### 4. Update Complaint Status
```javascript
PUT /api/complaints/status
Headers: { "Authorization": "Bearer token" }
{
  "complaint_id": 1,
  "status": "resolved"
}
```

### 5. Get All Volunteers (Admin Only)
```javascript
GET /api/complaints/admin/volunteers
Headers: { "Authorization": "Bearer admin_token" }
```

## Default Test Accounts

The database schema includes sample accounts:

1. **Admin Account**
   - Email: admin@cleanstreet.com
   - Password: admin123
   - Role: admin

2. **Volunteer Accounts**
   - John: john@cleanstreet.com / volunteer123
   - Jane: jane@cleanstreet.com / volunteer123
   - Mike: mike@cleanstreet.com / volunteer123

3. **Citizen Account**
   - Email: citizen@cleanstreet.com
   - Password: citizen123
   - Role: citizen

## Admin Dashboard Features

When an admin logs in, they can:

1. **View All Complaints**: See complete list with user and volunteer details
2. **View All Volunteers**: Get list of all users with volunteer role
3. **Assign Complaints**: Assign specific complaints to specific volunteers
4. **View Statistics**: Get overview of complaint counts by status
5. **Manage Users**: View all users and update their roles

## Status Workflow

1. **received**: New complaint submitted by citizen
2. **in_review**: Complaint assigned to volunteer and being worked on
3. **resolved**: Complaint has been resolved by volunteer

## Security Features

- JWT token authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation
- SQL injection prevention with parameterized queries

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:
- 400: Bad Request (missing/invalid data)
- 401: Unauthorized (no token/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Testing

You can test the API using tools like Postman, curl, or any HTTP client. Make sure to:
1. Register/login to get JWT token
2. Include Authorization header: `Bearer your_jwt_token`
3. Use appropriate role-based accounts for testing different features