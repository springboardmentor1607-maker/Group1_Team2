-- Database Schema for Clean Street Application

-- Users Table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'volunteer', 'admin')),
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photo TEXT,
    location_coords TEXT, -- JSON string with lat/lng coordinates
    address TEXT NOT NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'in_review', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sample Admin User (password: admin123)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@cleanstreet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample Volunteer Users (password: volunteer123)
INSERT INTO users (name, email, password, role, location) 
VALUES 
    ('John Volunteer', 'john@cleanstreet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'volunteer', 'Downtown Area'),
    ('Jane Helper', 'jane@cleanstreet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'volunteer', 'Uptown Area'),
    ('Mike Worker', 'mike@cleanstreet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'volunteer', 'East Side')
ON CONFLICT (email) DO NOTHING;

-- Sample Citizen User (password: citizen123)
INSERT INTO users (name, email, password, role) 
VALUES ('Test Citizen', 'citizen@cleanstreet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- Sample Complaints
INSERT INTO complaints (user_id, title, description, address, location_coords, status) 
VALUES 
    (4, 'Pothole on Main Street', 'Large pothole causing damage to vehicles', '123 Main Street, Downtown', '{"lat": 40.7128, "lng": -74.0060}', 'received'),
    (4, 'Overflowing Garbage Bin', 'Garbage bin near park is overflowing and attracting pests', '456 Park Avenue, Uptown', '{"lat": 40.7589, "lng": -73.9851}', 'received'),
    (4, 'Broken Street Light', 'Street light has been out for weeks making area unsafe', '789 Oak Street, East Side', '{"lat": 40.7505, "lng": -73.9934}', 'received')
ON CONFLICT DO NOTHING;