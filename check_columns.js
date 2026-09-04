const mysql = require('mysql2/promise');

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        const [columns] = await connection.query("DESCRIBE users");
        console.log('أعمدة جدول users:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkColumns();
