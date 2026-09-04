const mysql = require('mysql2/promise');

async function checkUid() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        // عرض أعمدة جدول users
        const [columns] = await connection.query("DESCRIBE users");
        console.log('أعمدة جدول users:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        
        // البحث عن uid أو haweya
        console.log('\nالبحث عن uid و haweya:');
        const uidCol = columns.find(col => col.Field === 'uid');
        const haweyaCol = columns.find(col => col.Field === 'haweya');
        
        console.log('uid موجود:', uidCol ? 'نعم' : 'لا');
        console.log('haweya موجود:', haweyaCol ? 'نعم' : 'لا');
        
        // عرض مثال على البيانات
        const [rows] = await connection.query("SELECT haweya, username FROM users LIMIT 3");
        console.log('\nأمثلة على البيانات:');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUid();
