const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.lreefiutqhkpjrsfjrwa:EshwarNellutla%4000@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function populateVolunteerStates() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Get all volunteers
        const res = await client.query("SELECT id, name FROM users WHERE role = 'volunteer' ORDER BY id;");
        const volunteers = res.rows;
        
        if (volunteers.length === 0) {
            console.log('No volunteers found');
            return;
        }

        const states = ['Telangana', 'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'];
        
        console.log(`Updating ${volunteers.length} volunteers...`);

        for (let i = 0; i < volunteers.length; i++) {
            const state = states[i % states.length];
            await client.query("UPDATE users SET state = $1 WHERE id = $2;", [state, volunteers[i].id]);
            console.log(`Updated volunteer ${volunteers[i].name} (ID: ${volunteers[i].id}) to State: ${state}`);
        }

        console.log('Volunteer states updated successfully');

    } catch (err) {
        console.error('Error updating volunteer states:', err);
    } finally {
        await client.end();
    }
}

populateVolunteerStates();
