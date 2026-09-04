const mysql = require('mysql2/promise');

async function testHaweya() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        const [rows] = await connection.query(
            'SELECT uid, haweya, username, cash, bank FROM users WHERE username = ?',
            ['KA7LA_0']
        );
        
        console.log('النتيجة:', rows);
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log('uid:', user.uid);
            console.log('haweya:', user.haweya);
            console.log('username:', user.username);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

testHaweya();
