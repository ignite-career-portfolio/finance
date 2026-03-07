
const { neon } = require('@neondatabase/serverless');

const databaseUrl = "postgresql://neondb_owner:npg_HIgqr8CFkw5V@ep-cool-fire-ailn3n8h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function count() {
    try {
        const reminders = await sql`SELECT COUNT(*) FROM reminders`;
        const todos = await sql`SELECT COUNT(*) FROM todos`;

        console.log(`Reminders: ${reminders[0].count}`);
        console.log(`Todos: ${todos[0].count}`);
    } catch (err) {
        console.error(err);
    }
}

count();
