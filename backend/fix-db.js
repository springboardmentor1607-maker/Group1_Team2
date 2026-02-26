const { pool } = require('./config/db');
require('dotenv').config();

async function fixComplaintsTable() {
    try {
        console.log('🔧 Fixing complaints table structure...\n');

        // First, set any non-numeric assigned_to values to NULL
        console.log('Cleaning assigned_to column...');
        await pool.query(`
            UPDATE complaints 
            SET assigned_to = NULL 
            WHERE assigned_to IS NOT NULL AND assigned_to !~ '^[0-9]+$'
        `);

        // Now convert the column to INTEGER
        console.log('Converting assigned_to to INTEGER type...');
        await pool.query(`
            ALTER TABLE complaints 
            ALTER COLUMN assigned_to TYPE INTEGER USING assigned_to::integer
        `);

        // Add foreign key constraint if it doesn't exist
        console.log('Adding foreign key constraint...');
        await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'fk_complaints_assigned_to'
                ) THEN
                    ALTER TABLE complaints 
                    ADD CONSTRAINT fk_complaints_assigned_to 
                    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);

        console.log('✅ Complaints table fixed successfully!');

        // Verify the change
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'complaints' AND column_name = 'assigned_to'
        `);

        console.log('\nColumn info after fix:');
        console.log(`  assigned_to: ${result.rows[0].data_type}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

fixComplaintsTable()
    .then(() => {
        console.log('\n✨ Database fix complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Fix failed:', err.message);
        process.exit(1);
    });
