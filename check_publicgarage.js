const mysql = require('mysql2/promise');

async function checkPublicGarage() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        // عرض أعمدة جدول publicgarage
        const [columns] = await connection.query("DESCRIBE publicgarage");
        console.log('أعمدة جدول publicgarage:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        
        // عرض بعض البيانات
        const [rows] = await connection.query("SELECT * FROM publicgarage LIMIT 5");
        console.log('\nأمثلة على البيانات:');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkPublicGarage();
