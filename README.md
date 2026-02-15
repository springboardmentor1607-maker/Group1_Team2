# Group1_Team2 - CleanStreet Application

This is Team 2's integrated full-stack application combining authentication and dashboard functionality.

## Team Members & Contributions

- **Aman-Raj**: Backend development (Node.js/Express, Authentication API)
- **Ansel**: Frontend authentication components (Login/Signup, Navbar, Theme system) 
- **Krishika**: Frontend dashboard components (Analytics, Maps, Charts with Tailwind CSS)
- **eshwar**:database(postgresql)

## Project Structure

### Backend (Node.js/Express)
- Authentication system with JWT
- postgresql database integration
- RESTful API endpoints
- Located in `/backend` directory

### Frontend (React + Vite)
- Modern React application with routing
- Authentication flow (Login/Signup)
- Dashboard with analytics and maps
- Theme switching capability
- Responsive design with Tailwind CSS and Bootstrap

## Technology Stack

**Frontend:**
- React 19.2.0
- Vite for build tooling
- React Router for navigation
- Tailwind CSS + Bootstrap for styling
- Framer Motion for animations
- Leaflet for maps
- Recharts for data visualization

**Backend:**
- Node.js with Express
- supabase for postgresql 
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend && npm install
   ```

2. **Environment Setup:**
   - Configure `.env` file in backend directory
   - Add MongoDB connection string and JWT secret

3. **Run Application:**
   ```bash
   # Start backend server
   cd backend && npm start
   
   # Start frontend development server (in new terminal)
   npm run dev
   ```

## Features

- **Authentication**: Secure login/signup system
- **Dashboard**: Real-time analytics and data visualization
- **Interactive Maps**: Location-based data display
- **Theme System**: Multiple color themes
- **Responsive Design**: Works on desktop and mobile
- **API Integration**: Frontend connects to backend for data

This integrated application demonstrates full-stack development with modern web technologies.
