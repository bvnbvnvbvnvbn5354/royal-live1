const mysql = require('mysql2/promise');

async function checkVehicles() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        // عرض أعمدة جدول vehicles
        const [columns] = await connection.query("DESCRIBE vehicles");
        console.log('أعمدة جدول vehicles:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        
        // عرض بعض البيانات
        const [rows] = await connection.query("SELECT * FROM vehicles LIMIT 5");
        console.log('\nأمثلة على البيانات:');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkVehicles();
