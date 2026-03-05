import { neon } from '@neondatabase/serverless';

async function addNotesColumn() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = neon(url);
    try {
        console.log('Adding notes column to budget table...');
        await sql('ALTER TABLE budget ADD COLUMN notes TEXT;');
        console.log('✅ Success: notes column added.');
    } catch (error) {
        if (error.code === '42701') {
            console.log('ℹ️ Column "notes" already exists.');
        } else {
            console.error('❌ Error updating database:', error);
            process.exit(1);
        }
    }
}

addNotesColumn();
