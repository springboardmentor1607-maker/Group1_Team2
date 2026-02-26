# 🧪 Manual Testing Guide - Clean Street Application

## ✅ Test Users Created

### Admin User
- **Email:** admin@test.com
- **Password:** admin123
- **Role:** admin
- **Phone:** 1234567890

### Volunteer Users
1. **John Volunteer**
   - **Email:** volunteer1@test.com
   - **Password:** volunteer123
   - **Phone:** 1234567891
   
2. **Sarah Helper**
   - **Email:** volunteer2@test.com
   - **Password:** volunteer123
   - **Phone:** 1234567892
   
3. **Mike Worker**
   - **Email:** volunteer3@test.com
   - **Password:** volunteer123
   - **Phone:** 1234567893

### Citizen Users
1. **Alice Citizen**
   - **Email:** citizen1@test.com
   - **Password:** citizen123
   - **Phone:** 1234567894
   
2. **Bob Resident**
   - **Email:** citizen2@test.com
   - **Password:** citizen123
   - **Phone:** 1234567895

---

## 🚀 Application URLs

- **Frontend:** http://localhost:3004
- **Backend API:** http://localhost:3001/api
- **Backend Health Check:** http://localhost:3001/health

---

## 📋 Manual Testing Checklist

### 1. Authentication Tests

#### Test Login Functionality
- [ ] **Login as Citizen** (citizen1@test.com / citizen123)
  - Should redirect to dashboard
  - Should see citizen role interface
  - Should NOT see admin menu items
  
- [ ] **Login as Volunteer** (volunteer1@test.com / volunteer123)
  - Should redirect to dashboard
  - Should see volunteer role interface
  - May have access to assigned complaints
  
- [ ] **Login as Admin** (admin@test.com / admin123)
  - Should redirect to dashboard
  - Should see admin menu items
  - Should have access to user management

#### Test Registration
- [ ] Create a new account with unique email
- [ ] Verify the user can login after registration
- [ ] Default role should be "citizen"

---

### 2. Complaint Management Tests

#### Test Complaint Creation (As Citizen)
- [ ] **Navigate to "Report Issue" page**
- [ ] **Fill in complaint form:**
  - Title: "Test Street Light Issue"
  - Type: Select any category
  - Priority: Select any priority
  - Address: "123 Test Street"
  - Landmark: "Near Test Park"
  - Description: "Street light not working"
  - Click on map to select location
  
- [ ] **Submit the complaint**
  - Should see success message
  - Should see "View My Complaints" button
  - Click "View My Complaints"
  
- [ ] **Verify complaint appears in list**
  - Check status is "Pending"
  - Check priority is displayed
  - Check location information is correct

#### Test Complaint Viewing
- [ ] **View All Complaints Page**
  - Should see all community complaints
  - Toggle between "All" and "My Issues"
  - Verify toggle filters correctly
  
- [ ] **My Complaints View**
  - Should only show complaints filed by logged-in user
  - Should show complaint count
  - Each complaint should show:
    - Complaint ID
    - Title
    - Status (with color badge)
    - Priority
    - Type
    - Created date/time
    - Address and landmark

---

### 3. Admin Dashboard Tests (Login as Admin)

#### Test User Management
- [ ] **Navigate to Admin Dashboard**
  - Should see link in sidebar/navigation
  
- [ ] **View All Users**
  - Should see list of all registered users
  - Should display: name, email, role, phone, location
  
- [ ] **Change User Role**
  - Select a citizen user
  - Change role to "volunteer"
  - Verify role change is successful
  - Change back to "citizen" if needed

#### Test Volunteer Assignment
- [ ] **View Complaints as Admin**
  - Should see all complaints with full details
  
- [ ] **Assign Volunteer to Complaint**
  - Select an unassigned complaint
  - Click "Assign Volunteer" or similar button
  - Select a volunteer from dropdown
  - Submit assignment
  - Verify complaint shows assigned volunteer name
  - Verify status changes to "In Progress"

#### Test Status Updates
- [ ] **Update Complaint Status**
  - Select a complaint
  - Change status from "Pending" to "In Progress"
  - Verify status badge updates
  - Change status to "Resolved"
  - Verify status badge shows green/success

---

### 4. Map Functionality Tests

#### Test Map Interaction
- [ ] **Navigate to Map View**
  - Should display interactive map
  
- [ ] **View Complaints on Map**
  - Markers should appear for complaints with coordinates
  - Click on marker to see complaint details
  
- [ ] **Location Selection During Complaint Creation**
  - Map should allow clicking to select location
  - Selected coordinates should be captured
  - Address field should update (if geocoding enabled)

---

### 5. Profile Management Tests

#### Test Profile View
- [ ] **Navigate to Profile Page**
  - Should display current user information
  - Name, email, phone, location, role
  
#### Test Profile Update
- [ ] **Update Profile Information**
  - Change name
  - Update phone number
  - Update location
  - Submit changes
  - Verify updates are saved
  - Refresh page to confirm persistence

---

### 6. Role-Based Access Control Tests

#### Test Citizen Restrictions
- [ ] **Login as Citizen**
  - Should NOT see "Admin Dashboard" link
  - Should NOT be able to access /admin route directly
  - Should NOT be able to assign volunteers
  - Should NOT be able to change user roles
  - SHOULD be able to create complaints
  - SHOULD be able to view own complaints
  - SHOULD be able to view all community complaints

#### Test Volunteer Access
- [ ] **Login as Volunteer**
  - Should see complaints list
  - May see assigned complaints highlighted
  - Should NOT see admin user management
  - SHOULD be able to update status of assigned complaints (if implemented)

#### Test Admin Access
- [ ] **Login as Admin**
  - SHOULD see admin dashboard link
  - SHOULD be able to view all users
  - SHOULD be able to change user roles
  - SHOULD be able to assign volunteers
  - SHOULD be able to update any complaint status
  - SHOULD be able to see all complaints details

---

### 7. Dashboard Statistics Tests

#### Test Stats Display
- [ ] **View Dashboard Stats**
  - Total complaints count should be accurate
  - Pending complaints count
  - In Progress complaints count
  - Resolved complaints count
  - Stats should update when complaints change

---

### 8. UI/UX Tests

#### Test Responsive Design
- [ ] Resize browser window
- [ ] Test on different screen sizes
- [ ] Verify mobile menu works
- [ ] Check all buttons are clickable
- [ ] Ensure text is readable

#### Test Theme Toggle (if implemented)
- [ ] Switch between light/dark mode
- [ ] Verify theme persists across navigation

#### Test Navigation
- [ ] Click all menu items
- [ ] Verify proper page transitions
- [ ] Check back button works correctly
- [ ] Test all internal links

---

### 9. Data Validation Tests

#### Test Form Validation
- [ ] **Complaint Form**
  - Try submitting with empty required fields
  - Should show validation errors
  - Should not submit until valid
  
- [ ] **Login Form**
  - Try invalid email format
  - Try wrong password
  - Should show appropriate error messages

---

### 10. Real-Time Updates Tests

#### Test Data Refresh
- [ ] Create a complaint
- [ ] Navigate to complaints list
- [ ] New complaint should appear immediately
- [ ] No page refresh should be needed

---

## 🔍 Known Issues to Check

- [ ] Check if complaint status defaults to "Pending" or null
- [ ] Verify map markers load correctly with existing complaints
- [ ] Check if search/filter functionality works (if implemented)
- [ ] Test pagination (if complaint list is long)

---

## 📊 Automated Test Results

All backend API tests have passed successfully:
- ✅ Authentication System (Admin/Volunteer/Citizen login)
- ✅ Complaint Creation
- ✅ Complaint Listing (All & User-specific)
- ✅ Complaint Statistics
- ✅ Volunteer Assignment
- ✅ Status Updates
- ✅ Role-Based Access Control
- ✅ Profile Updates

---

## 🐛 Reporting Issues

If you find any bugs or issues during testing:
1. Note the exact steps to reproduce
2. Record user role being tested
3. Capture any error messages
4. Take screenshots if possible
5. Check browser console for errors (F12)

---

## 📝 Testing Best Practices

1. **Test in order**: Start with authentication, then move to features
2. **Use multiple browsers**: Test in Chrome, Firefox, Safari
3. **Clear cache**: If you see strange behavior, try clearing browser cache
4. **Test edge cases**: Try unusual inputs, very long text, special characters
5. **Check console**: Always keep browser dev tools open (F12)

---

## ✅ Success Criteria

The application passes testing if:
- [ ] All user types can login successfully
- [ ] Citizens can create and view complaints
- [ ] Admin can manage users and assign volunteers
- [ ] All complaints appear in community view
- [ ] Individual users can see their own complaints
- [ ] Status updates work and display correctly
- [ ] Map shows complaint locations accurately
- [ ] Navigation works smoothly
- [ ] No console errors during normal usage
- [ ] Role-based restrictions are enforced

---

**Happy Testing! 🎉**
