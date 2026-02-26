#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials
const ADMIN_CREDS = { email: 'admin@test.com', password: 'admin123' };
const VOLUNTEER_CREDS = { email: 'volunteer1@test.com', password: 'volunteer123' };
const CITIZEN_CREDS = { email: 'citizen1@test.com', password: 'citizen123' };

let adminToken, volunteerToken, citizenToken;
let testComplaintId;

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
    const symbol = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${symbol} ${name}`, color);
    if (details) log(`   ${details}`, 'cyan');
}

async function testAuth() {
    log('\n📋 Testing Authentication System...', 'blue');
    
    try {
        // Test Admin Login
        const adminRes = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDS);
        adminToken = adminRes.data.token;
        logTest('Admin Login', !!adminToken, `Role: ${adminRes.data.user.role}`);

        // Test Volunteer Login
        const volunteerRes = await axios.post(`${BASE_URL}/auth/login`, VOLUNTEER_CREDS);
        volunteerToken = volunteerRes.data.token;
        logTest('Volunteer Login', !!volunteerToken, `Role: ${volunteerRes.data.user.role}`);

        // Test Citizen Login
        const citizenRes = await axios.post(`${BASE_URL}/auth/login`, CITIZEN_CREDS);
        citizenToken = citizenRes.data.token;
        logTest('Citizen Login', !!citizenToken, `Role: ${citizenRes.data.user.role}`);

        // Test Profile Access
        const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Profile Access', profileRes.data.success, `User: ${profileRes.data.user.name}`);

        return true;
    } catch (error) {
        logTest('Authentication Test', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testComplaintCreation() {
    log('\n📋 Testing Complaint Creation...', 'blue');
    
    try {
        const complaintData = {
            title: 'Test Pothole on Main Street',
            type: 'Road Maintenance',
            priority: 'High',
            description: 'Large pothole causing traffic issues',
            address: '123 Main Street, Downtown',
            landmark: 'Near City Hall',
            latitude: 40.7128,
            longitude: -74.0060
        };

        const response = await axios.post(`${BASE_URL}/complaints`, complaintData, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });

        testComplaintId = response.data.data.id;
        logTest('Create Complaint (Citizen)', response.data.success, 
            `ID: ${testComplaintId} | Status: ${response.data.data.status}`);

        return true;
    } catch (error) {
        logTest('Create Complaint', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testComplaintListing() {
    log('\n📋 Testing Complaint Listing...', 'blue');
    
    try {
        // Test getting all complaints
        const allComplaints = await axios.get(`${BASE_URL}/complaints`, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        logTest('Get All Complaints', allComplaints.data.success, 
            `Count: ${allComplaints.data.data.length}`);

        // Test getting user's own complaints
        const myComplaints = await axios.get(`${BASE_URL}/complaints/my-complaints`, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        logTest('Get My Complaints', myComplaints.data.success, 
            `Count: ${myComplaints.data.data.length}`);

        // Test getting stats
        const stats = await axios.get(`${BASE_URL}/complaints/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Get Complaint Stats', stats.data.success, 
            `Total: ${stats.data.stats.total} | Pending: ${stats.data.stats.pending}`);

        return true;
    } catch (error) {
        logTest('Complaint Listing', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testVolunteerAssignment() {
    log('\n📋 Testing Volunteer Assignment (Admin Only)...', 'blue');
    
    try {
        // First, get list of volunteers
        const usersRes = await axios.get(`${BASE_URL}/auth/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const volunteers = usersRes.data.users.filter(u => u.role === 'volunteer');
        logTest('Get Users List', volunteers.length > 0, `Volunteers found: ${volunteers.length}`);

        if (volunteers.length > 0 && testComplaintId) {
            // Assign volunteer to complaint
            const assignRes = await axios.post(`${BASE_URL}/complaints/assign-volunteer`, {
                complaintId: testComplaintId,
                volunteerId: volunteers[0].id
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            logTest('Assign Volunteer to Complaint', assignRes.data.success, 
                `Volunteer: ${volunteers[0].name} → Complaint #${testComplaintId}`);
        }

        return true;
    } catch (error) {
        logTest('Volunteer Assignment', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testStatusUpdate() {
    log('\n📋 Testing Status Updates...', 'blue');
    
    try {
        if (!testComplaintId) {
            logTest('Status Update', false, 'No complaint ID available');
            return false;
        }

        // Update status to In Progress
        const updateRes = await axios.put(`${BASE_URL}/complaints/${testComplaintId}/status`, {
            status: 'In Progress'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        logTest('Update Complaint Status', updateRes.data.success, 
            `Complaint #${testComplaintId} → In Progress`);

        // Update to Resolved
        const resolveRes = await axios.put(`${BASE_URL}/complaints/${testComplaintId}/status`, {
            status: 'Resolved'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        logTest('Resolve Complaint', resolveRes.data.success, 
            `Complaint #${testComplaintId} → Resolved`);

        return true;
    } catch (error) {
        logTest('Status Update', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testRoleBasedAccess() {
    log('\n📋 Testing Role-Based Access Control...', 'blue');
    
    try {
        // Citizen should NOT be able to access admin functions
        try {
            await axios.get(`${BASE_URL}/auth/admin/users`, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            logTest('Citizen Access to Admin Functions', false, 'Should be blocked but succeeded');
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                logTest('Citizen Blocked from Admin Functions', true, 'Access properly denied');
            } else {
                logTest('Citizen Access Control', false, 'Unexpected error');
            }
        }

        // Admin should be able to access all functions
        const adminAccess = await axios.get(`${BASE_URL}/auth/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        logTest('Admin Access to All Functions', adminAccess.data.success, 
            `Can access user management`);

        return true;
    } catch (error) {
        logTest('Role-Based Access', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function testUserProfileUpdate() {
    log('\n📋 Testing User Profile Updates...', 'blue');
    
    try {
        const updateData = {
            name: 'Alice Updated',
            phone: '9999999999',
            location: 'North District - Updated'
        };

        const response = await axios.put(`${BASE_URL}/auth/profile`, updateData, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });

        logTest('Update User Profile', response.data.success, 
            `Name: ${response.data.user.name}`);

        return true;
    } catch (error) {
        logTest('Profile Update', false, error.response?.data?.message || error.message);
        return false;
    }
}

async function runAllTests() {
    log('\n🚀 Starting Comprehensive Application Tests', 'yellow');
    log('='.repeat(50), 'yellow');
    
    const results = {
        passed: 0,
        failed: 0
    };

    try {
        // Check if server is running
        await axios.get(`${BASE_URL.replace('/api', '')}/health`).catch(() => {
            throw new Error('Server is not running. Please start the backend server first.');
        });

        log('✅ Server is running\n', 'green');

        // Run all tests
        const tests = [
            { name: 'Authentication', fn: testAuth },
            { name: 'Complaint Creation', fn: testComplaintCreation },
            { name: 'Complaint Listing', fn: testComplaintListing },
            { name: 'Volunteer Assignment', fn: testVolunteerAssignment },
            { name: 'Status Updates', fn: testStatusUpdate },
            { name: 'Role-Based Access', fn: testRoleBasedAccess },
            { name: 'Profile Updates', fn: testUserProfileUpdate }
        ];

        for (const test of tests) {
            const result = await test.fn();
            if (result) results.passed++;
            else results.failed++;
        }

        // Print summary
        log('\n' + '='.repeat(50), 'yellow');
        log('📊 TEST SUMMARY', 'yellow');
        log('='.repeat(50), 'yellow');
        log(`✅ Passed: ${results.passed}`, 'green');
        log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
        log(`📈 Total: ${results.passed + results.failed}`, 'cyan');
        log('='.repeat(50) + '\n', 'yellow');

        if (results.failed === 0) {
            log('🎉 All tests passed! Your application is working correctly.', 'green');
        } else {
            log('⚠️  Some tests failed. Please check the errors above.', 'red');
        }

    } catch (error) {
        log(`\n❌ Test suite failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run the tests
runAllTests().then(() => {
    process.exit(0);
}).catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
});
