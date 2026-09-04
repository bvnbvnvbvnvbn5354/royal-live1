const mysql = require('mysql2/promise');

async function checkTables() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        const [tables] = await connection.query("SHOW TABLES");
        console.log('الجداول الموجودة في قاعدة البيانات:');
        tables.forEach(table => {
            console.log('- ' + Object.values(table)[0]);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTables();
