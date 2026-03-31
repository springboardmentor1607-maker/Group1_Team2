const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedTenVolunteers() {
    try {
        console.log('🌱 Seeding 10 more volunteers...\n');

        const volunteerPassword = await bcrypt.hash('volunteer123', 10);

        const newVolunteers = [
            { name: 'Arjun Reddy', email: 'arjun.v@cleanstreet.com', phone: '9876543210', location: 'Banjara Hills', state: 'Telangana' },
            { name: 'Priya Sharma', email: 'priya.s@cleanstreet.com', phone: '9876543211', location: 'Kukatpally', state: 'Telangana' },
            { name: 'Karthik Rao', email: 'karthik.r@cleanstreet.com', phone: '9876543212', location: 'Indiranagar', state: 'Telangana' },
            { name: 'Ananya Iyer', email: 'ananya.i@cleanstreet.com', phone: '9876543213', location: 'Koramangala', state: 'Karnataka' },
            { name: 'Rahul Hegde', email: 'rahul.h@cleanstreet.com', phone: '9876543214', location: 'HSR Layout', state: 'Karnataka' },
            { name: 'Deepa Kamath', email: 'deepa.k@cleanstreet.com', phone: '9876543215', location: 'Whitefield', state: 'Karnataka' },
            { name: 'Siddharth Malhotra', email: 'sid.m@cleanstreet.com', phone: '9876543216', location: 'Andheri', state: 'Maharashtra' },
            { name: 'Zoya Khan', email: 'zoya.k@cleanstreet.com', phone: '9876543217', location: 'Bandra', state: 'Maharashtra' },
            { name: 'Vikram Singh', email: 'vikram.s@cleanstreet.com', phone: '9876543218', location: 'Rohini', state: 'Delhi' },
            { name: 'Meenakshi Raman', email: 'meena.r@cleanstreet.com', phone: '9876543219', location: 'T. Nagar', state: 'Tamil Nadu' }
        ];

        for (const v of newVolunteers) {
            // Check if user already exists
            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [v.email]);
            if (existing.rows.length > 0) {
                console.log(`⚠️  User ${v.email} already exists, skipping...`);
                continue;
            }

            await pool.query(`
                INSERT INTO users (name, email, password, phone, location, state, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [v.name, v.email, volunteerPassword, v.phone, v.location, v.state, 'volunteer']);
            console.log(`✅ Created volunteer: ${v.name} (${v.location}, ${v.state})`);
        }

        console.log('\n📊 Verifying total volunteers...');
        const result = await pool.query("SELECT count(*) FROM users WHERE role = 'volunteer'");
        console.log(`   Total volunteers now: ${result.rows[0].count}`);

        console.log('\n✨ Seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding volunteers:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedTenVolunteers().then(() => {
    process.exit(0);
});
