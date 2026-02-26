const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

async function seedTestUsers() {
    try {
        console.log('🌱 Seeding test users...\n');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const volunteerPassword = await bcrypt.hash('volunteer123', 10);
        const citizenPassword = await bcrypt.hash('citizen123', 10);

        // Delete existing test users first
        await pool.query(`DELETE FROM users WHERE email LIKE '%@test.com'`);
        console.log('🗑️  Cleared existing test users\n');

        // Create Admin User
        const adminResult = await pool.query(`
            INSERT INTO users (name, email, password, phone, location, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, ['Admin User', 'admin@test.com', adminPassword, '1234567890', 'Admin Office', 'admin']);
        console.log('✅ Admin user created:');
        console.log('   Email: admin@test.com');
        console.log('   Password: admin123');
        console.log('   Role: admin\n');

        // Create Volunteer Users
        const volunteers = [
            ['John Volunteer', 'volunteer1@test.com', '1234567891', 'Downtown Area'],
            ['Sarah Helper', 'volunteer2@test.com', '1234567892', 'Uptown Area'],
            ['Mike Worker', 'volunteer3@test.com', '1234567893', 'East Side']
        ];

        for (const [name, email, phone, location] of volunteers) {
            await pool.query(`
                INSERT INTO users (name, email, password, phone, location, role)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [name, email, volunteerPassword, phone, location, 'volunteer']);
        }
        console.log('✅ Volunteer users created:');
        console.log('   Email: volunteer1@test.com | Password: volunteer123 | Name: John Volunteer');
        console.log('   Email: volunteer2@test.com | Password: volunteer123 | Name: Sarah Helper');
        console.log('   Email: volunteer3@test.com | Password: volunteer123 | Name: Mike Worker\n');

        // Create Regular Citizen Users for testing
        const citizens = [
            ['Alice Citizen', 'citizen1@test.com', '1234567894', 'North District'],
            ['Bob Resident', 'citizen2@test.com', '1234567895', 'South District']
        ];

        for (const [name, email, phone, location] of citizens) {
            await pool.query(`
                INSERT INTO users (name, email, password, phone, location, role)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [name, email, citizenPassword, phone, location, 'citizen']);
        }
        console.log('✅ Regular citizen users created:');
        console.log('   Email: citizen1@test.com | Password: citizen123 | Name: Alice Citizen');
        console.log('   Email: citizen2@test.com | Password: citizen123 | Name: Bob Resident\n');

        // Show total users by role
        const result = await pool.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role 
            ORDER BY role
        `);

        console.log('📊 Total users in database:');
        result.rows.forEach(row => {
            console.log(`   ${row.role}: ${row.count}`);
        });

        console.log('\n✨ Test users seeded successfully!');
        console.log('\n📝 Login Credentials Summary:');
        console.log('   Admin: admin@test.com / admin123');
        console.log('   Volunteer: volunteer1@test.com / volunteer123');
        console.log('   Citizen: citizen1@test.com / citizen123');
        
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the seed function
seedTestUsers().then(() => {
    console.log('\n✅ Seeding complete!');
    process.exit(0);
}).catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
