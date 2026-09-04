const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkPassword() {
    const connection = await mysql.createConnection({
        host: '51.210.223.180',
        user: 'gs111663',
        password: '0zf9hg2p',
        database: 'gs111663'
    });

    try {
        // الحصول على كلمة مرور مستخدم للتجربة
        const [rows] = await connection.query(
            'SELECT username, password FROM users LIMIT 1'
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log('اسم المستخدم:', user.username);
            console.log('كلمة المرور المشفرة:', user.password);
            console.log('الطول:', user.password.length);
            
            // التحقق إذا كانت bcrypt
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                console.log('نوع التشفير: bcrypt');
            } else {
                console.log('نوع التشفير: غير معروف (ربما MD5 أو SHA256)');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkPassword();
