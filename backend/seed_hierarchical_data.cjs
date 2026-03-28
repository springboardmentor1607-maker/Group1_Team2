const { pool } = require('./config/db');

const states = [
    { name: 'Telangana', zones: ['Warangal', 'Indiranagar', 'Kukatpally', 'Banjara Hills'] },
    { name: 'Karnataka', zones: ['Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar'] },
    { name: 'Maharashtra', zones: ['Andheri', 'Bandra', 'Pune Central', 'Nagpur South'] },
    { name: 'Delhi', zones: ['Dwarka', 'Rohini', 'Connaught Place', 'Saket'] },
    { name: 'Tamil Nadu', zones: ['Adyar', 'T. Nagar', 'Anna Nagar', 'Velachery'] }
];

const issueTypes = ['pothole', 'garbage', 'streetlight', 'water', 'other'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Pending', 'In Progress', 'Resolved'];

async function seed() {
    try {
        console.log('Starting hierarchical data seeding...');

        // 1. Clear existing sample labels if needed (optional)
        // For this task, we just want to ADD data.

        const citizenIds = [35, 36, 37, 39];
        let totalComplaints = 0;

        for (const stateObj of states) {
            for (const zoneName of stateObj.zones) {
                // Find or create zone
                let zoneRes = await pool.query('SELECT id FROM zones WHERE name = $1 AND state = $2', [zoneName, stateObj.name]);
                let zoneId;
                
                if (zoneRes.rows.length === 0) {
                    const newZone = await pool.query(
                        'INSERT INTO zones (name, state, description) VALUES ($1, $2, $3) RETURNING id',
                        [zoneName, stateObj.name, `Automated zone for ${zoneName}, ${stateObj.name}`]
                    );
                    zoneId = newZone.rows[0].id;
                } else {
                    zoneId = zoneRes.rows[0].id;
                }

                // Create 1-2 complaints per zone
                const complaintsPerZone = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < complaintsPerZone; i++) {
                    const userId = citizenIds[Math.floor(Math.random() * citizenIds.length)];
                    const type = issueTypes[Math.floor(Math.random() * issueTypes.length)];
                    const priority = priorities[Math.floor(Math.random() * priorities.length)];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} issue in ${zoneName}`;
                    
                    await pool.query(
                        `INSERT INTO complaints (user_id, title, description, type, priority, status, address, zone_id, latitude, longitude)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [
                            userId,
                            title,
                            `Sample description for ${title}. Please address this as soon as possible.`,
                            type,
                            priority,
                            status,
                            `${zoneName} main road, ${stateObj.name}`,
                            zoneId,
                            (Math.random() * (20 - 10) + 10).toFixed(6), // Random lat in India range roughly
                            (Math.random() * (85 - 75) + 75).toFixed(6)  // Random lon in India range roughly
                        ]
                    );
                    totalComplaints++;
                }
            }
        }

        console.log(`Successfully seeded ${states.length} states, ${states.reduce((acc, s) => acc + s.zones.length, 0)} zones, and ${totalComplaints} complaints.`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
