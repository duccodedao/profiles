// api/checkout.js
const { SePayPgClient } = require('sepay-pg-node');
const admin = require('firebase-admin');

// Sửa lỗi khởi tạo Firebase nhiều lần
if (!admin.apps.length) {
    // Kiểm tra xem biến môi trường có tồn tại không
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('Thiếu biến môi trường FIREBASE_SERVICE_ACCOUNT');
    }
    
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Lỗi JSON Firebase Key:", error);
    }
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // CORS headers (đề phòng lỗi cross-origin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { amount, message } = req.body;

        // 1. Kiểm tra cấu hình trong Database
        const configDoc = await db.collection('settings').doc('sepay_config').get();
        
        if (!configDoc.exists) {
            // Trả về lỗi JSON rõ ràng thay vì sập server
            return res.status(400).json({ error: 'Admin chưa cấu hình SePay (Merchant ID/Secret Key) trong trang quản trị.' });
        }
        
        const configData = configDoc.data();
        const merchant_id = configData.merchant_id;
        const secret_key = configData.secret_key;

        if (!merchant_id || !secret_key) {
            return res.status(400).json({ error: 'Thông tin SePay chưa đầy đủ. Vui lòng liên hệ Admin.' });
        }

        // 2. Khởi tạo Client
        const client = new SePayPgClient({
            env: 'app',
            merchant_id: merchant_id,
            secret_key: secret_key
        });

        const orderId = `DONATE_${Date.now()}`;

        // 3. Tạo URL
        const checkoutUrl = client.checkout.initCheckoutUrl({
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: orderId,
            order_amount: parseInt(amount),
            currency: 'VND',
            order_description: message || 'Ung ho tac gia',
            success_url: `${req.headers.origin || 'https://hdd.io.vn/'}/?status=success`,
            error_url: `${req.headers.origin || 'https://hdd.io.vn/'}/?status=error`,
        });

        // 4. Lưu đơn nháp
        await db.collection('donations').doc(orderId).set({
            amount: parseInt(amount),
            message: message || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            orderId
        });

        return res.status(200).json({ url: checkoutUrl });

    } catch (error) {
        console.error("Server Error:", error);
        // Quan trọng: Trả về JSON để Frontend hiển thị được lỗi
        return res.status(500).json({ error: error.message });
    }
};
