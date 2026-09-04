const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { whirlpool } = require('hash-wasm');

const app = express();
const PORT = 3002;

// إعدادات قاعدة البيانات
const dbConfig = {
    host: '51.210.223.180',
    user: 'gs111663',
    password: '0zf9hg2p',
    database: 'gs111663',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000
};

const CAR_PRICES = {
    400: 100000, 401: 80000, 402: 150000, 404: 60000, 405: 120000, 410: 50000,
    411: 500000, 412: 90000, 415: 450000, 418: 70000, 420: 40000, 421: 85000,
    426: 110000, 429: 600000, 436: 75000, 438: 45000, 439: 65000, 445: 95000,
    451: 700000, 458: 80000, 466: 55000, 467: 60000, 474: 70000, 475: 85000,
    477: 250000, 480: 350000, 491: 65000, 492: 50000, 495: 400000, 496: 55000,
    500: 180000, 503: 800000, 506: 550000, 507: 100000, 516: 75000, 517: 90000,
    518: 80000, 526: 70000, 527: 65000, 528: 300000, 529: 60000, 533: 400000,
    534: 95000, 535: 120000, 536: 85000, 540: 70000, 541: 650000, 542: 75000,
    543: 80000, 545: 90000, 546: 85000, 547: 65000, 549: 95000, 550: 70000,
    551: 80000, 554: 150000, 555: 200000, 558: 180000, 559: 450000, 560: 350000,
    561: 120000, 562: 500000, 565: 250000, 566: 70000, 567: 90000, 568: 60000,
    575: 75000, 576: 85000, 579: 250000, 580: 100000, 585: 80000, 587: 300000,
    589: 65000, 596: 200000, 597: 250000, 598: 300000, 599: 350000, 600: 95000,
    602: 150000, 603: 200000
};

const pool = mysql.createPool(dbConfig);

function normalizeVehicleColor(value, fallback = 1) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(255, Math.max(0, Math.floor(numeric)));
}

// دالة للتحقق من كلمة المرور (دعم Whirlpool, SHA256, bcrypt والمقارنة المباشرة)
async function verifyPassword(plainPassword, hashedPassword) {
    // مقارنة مباشرة (للكلمات الأصلية)
    if (plainPassword === hashedPassword) {
        return true;
    }
    
    // Whirlpool (WP_Hash في SA-MP)
    try {
        const whirlpoolHash = await whirlpool(plainPassword);
        if (whirlpoolHash.toUpperCase() === hashedPassword) {
            return true;
        }
    } catch (e) {
        console.error('Whirlpool error:', e);
    }
    
    // إذا كانت bcrypt
    if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // إذا كانت SHA256
    const sha256Hash = crypto.createHash('sha256').update(plainPassword).digest('hex').toUpperCase();
    return sha256Hash === hashedPassword;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'samp-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Middleware للتحقق من تسجيل الدخول
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ success: false, error: 'يجب تسجيل الدخول' });
        }
        return res.redirect('/login.html');
    }
    next();
};

// الصفحة الرئيسية
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard.html');
    } else {
        res.redirect('/login.html');
    }
});

// API تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await pool.query(
            'SELECT uid, username, password, cash, bank FROM users WHERE username = ?',
            [username]
        );
        
        if (rows.length === 0) {
            return res.json({ success: false, error: 'اسم المستخدم غير موجود' });
        }
        
        const user = rows[0];
        
        // التحقق من كلمة المرور (دعم SHA256 و bcrypt)
        const passwordMatch = await verifyPassword(password, user.password);
        
        if (!passwordMatch) {
            return res.json({ success: false, error: 'كلمة المرور غير صحيحة' });
        }
        
        req.session.userId = user.uid;
        req.session.username = user.username;
        req.session.money = user.bank;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, error: 'حدث خطأ في الخادم' });
    }
});

// API للحصول على بيانات المستخدم
app.get('/api/user', requireLogin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT uid, haweya, username, cash, bank FROM users WHERE uid = ?',
            [req.session.userId]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            user.money = user.bank;
            req.session.money = user.money;
            res.json({ success: true, user });
        } else {
            res.json({ success: false, error: 'المستخدم غير موجود' });
        }
    } catch (error) {
        console.error('User data error:', error);
        res.json({ success: false, error: 'حدث خطأ في الخادم' });
    }
});

// API تسجيل الخروج
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// API تحويل الأموال
app.post('/api/transfer', requireLogin, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { toUsername } = req.body;
        const amount = Number(req.body.amount);
        const fromUserId = req.session.userId;
        
        // التحقق من صحة المبلغ
        if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
            throw new Error('المبلغ يجب أن يكون رقماً صحيحاً أكبر من صفر');
        }
        
        // الحصول على بيانات المرسل
        const [senderRows] = await connection.query(
            'SELECT uid, username, cash, bank FROM users WHERE uid = ?',
            [fromUserId]
        );
        
        if (senderRows.length === 0) {
            throw new Error('المستخدم غير موجود');
        }
        
        const sender = senderRows[0];
        
        // التحقق من كفاية الرصيد (البنك فقط)
        if (sender.bank < amount) {
            throw new Error('رصيدك في البنك غير كافٍ');
        }
        
        // التحقق من عدم التحويل لنفسك
        if (sender.username.toLowerCase() === toUsername.toLowerCase()) {
            throw new Error('لا يمكنك التحويل لنفسك');
        }
        
        // الحصول على بيانات المستقبل
        const [receiverRows] = await connection.query(
            'SELECT uid, username, cash, bank FROM users WHERE username = ?',
            [toUsername]
        );
        
        if (receiverRows.length === 0) {
            throw new Error('المستخدم المستقبل غير موجود');
        }
        
        const receiver = receiverRows[0];
        
        // خصم المبلغ من البنك
        await connection.query(
            'UPDATE users SET bank = bank - ? WHERE uid = ?',
            [amount, fromUserId]
        );
        
        // إضافة المبلغ للمستقبل (إلى البنك)
        await connection.query(
            'UPDATE users SET bank = bank + ? WHERE uid = ?',
            [amount, receiver.uid]
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: `تم تحويل $${amount.toLocaleString()} إلى ${receiver.username} بنجاح` 
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Transfer error:', error);
        res.json({ success: false, error: error.message || 'حدث خطأ في التحويل' });
    } finally {
        connection.release();
    }
});

// API شراء سيارة
app.post('/api/buy-car', requireLogin, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const carModel = Number(req.body.carModel);
        const color1 = normalizeVehicleColor(req.body.color1, 1);
        const color2 = normalizeVehicleColor(req.body.color2, 1);
        const userId = req.session.userId;
        const username = req.session.username;
        const carPrice = CAR_PRICES[carModel];
        
        if (!carPrice) {
            throw new Error('هذه السيارة غير متوفرة في المعرض');
        }
        
        // الحصول على بيانات المستخدم
        const [userRows] = await connection.query(
            'SELECT uid, username, bank FROM users WHERE uid = ?',
            [userId]
        );
        
        if (userRows.length === 0) {
            throw new Error('المستخدم غير موجود');
        }
        
        const user = userRows[0];
        
        // التحقق من كفاية الرصيد
        if (user.bank < carPrice) {
            throw new Error('رصيدك في البنك غير كافٍ لشراء هذه السيارة');
        }
        
        // الحصول على موقع الوكالة العامة
        const [garageRows] = await connection.query(
            'SELECT pos_x, pos_y, pos_z, pos_r FROM publicgarage LIMIT 1'
        );
        
        if (garageRows.length === 0) {
            throw new Error('لا يوجد موقع للوكالة العامة');
        }
        
        const garage = garageRows[0];
        
        // إضافة السيارة
        await connection.query(
            `INSERT INTO vehicles (ownerid, owner, modelid, pos_x, pos_y, pos_z, pos_a, color1, color2) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, carModel, garage.pos_x, garage.pos_y, garage.pos_z, garage.pos_r, color1 || 0, color2 || 0]
        );
        
        // خصم السعر من البنك
        await connection.query(
            'UPDATE users SET bank = bank - ? WHERE uid = ?',
            [carPrice, userId]
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: `تم شراء سيارة موديل ${carModel} بنجاح مقابل $${carPrice.toLocaleString()}` 
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Buy car error:', error);
        res.json({ success: false, error: error.message || 'حدث خطأ في شراء السيارة' });
    } finally {
        connection.release();
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
