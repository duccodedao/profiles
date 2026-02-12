// api/checkout.js
const { SePayPgClient } = require('sepay-pg-node');
const admin = require('firebase-admin');

// Khởi tạo Firebase Admin (Singleton)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}
const db = admin.firestore();

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { amount, message, userLink } = req.body;

        // 1. Lấy cấu hình SePay từ Firestore (được lưu bởi Admin ở Frontend)
        const configDoc = await db.collection('settings').doc('sepay_config').get();
        if (!configDoc.exists) throw new Error('Chưa cấu hình SePay trong Admin');
        
        const { merchant_id, secret_key } = configDoc.data();

        // 2. Khởi tạo SePay Client
        const client = new SePayPgClient({
            env: 'app', // Hoặc 'sandbox' nếu test
            merchant_id: merchant_id,
            secret_key: secret_key
        });

        const orderId = `DONATE_${Date.now()}`;

        // 3. Tạo URL thanh toán
        const checkoutUrl = client.checkout.initCheckoutUrl({
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: orderId,
            order_amount: parseInt(amount),
            currency: 'VND',
            order_description: message || 'Ung ho tac gia',
            success_url: `${req.headers.origin}/?status=success`, // Quay về trang chủ
            error_url: `${req.headers.origin}/?status=error`,
        });

        // 4. Lưu đơn hàng nháp vào Firestore (để đối soát sau này)
        await db.collection('donations').doc(orderId).set({
            amount: parseInt(amount),
            message,
            status: 'pending',
            createdAt: new Date().toISOString(),
            orderId
        });

        res.status(200).json({ url: checkoutUrl });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
