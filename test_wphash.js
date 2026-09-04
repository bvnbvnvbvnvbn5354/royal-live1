const { whirlpool } = require('hash-wasm');

// كلمة المرور الأصلية
const plainPassword = '123456';

// الهاش الموجود في قاعدة البيانات
const storedHash = 'FD9D94340DBD72C11B37EBB0D2A19B4D05E00FD78E4E2CE8923B9EA3A54E900DF181CFB112A8A73228D1F3551680E2AD9701A4FCFB248FA7FA77B95180628BB2';

console.log('كلمة المرور:', plainPassword);
console.log('الهاش المخزن:', storedHash);
console.log('طول الهاش:', storedHash.length);

// تجربة Whirlpool مع hash-wasm
async function testWhirlpool() {
    try {
        const whirlpoolHash = await whirlpool(plainPassword);
        const whirlpoolHashUpper = whirlpoolHash.toUpperCase();
        console.log('\nWhirlpool Hash:', whirlpoolHashUpper);
        console.log('التطابق:', whirlpoolHashUpper === storedHash ? '✅ نعم' : '❌ لا');
    } catch (e) {
        console.log('\nخطأ:', e.message);
    }
}

testWhirlpool();
