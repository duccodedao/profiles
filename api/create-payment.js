const { SePayPgClient } = require('sepay-pg-node');
const admin = require('firebase-admin');

// --- CẤU HÌNH FIREBASE & SEPAY (Lấy từ biến môi trường Vercel) ---
if (!admin.apps.length) {
  try {
    // Trên Vercel, ta sẽ lưu nội dung file json vào biến môi trường FIREBASE_SERVICE_ACCOUNT
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Firebase Init Error:", error);
  }
}

const db = admin.firestore();

const sepayClient = new SePayPgClient({
  env: 'sandbox', // Đổi thành 'production' khi chạy thật
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY
});

export default async function handler(req, res) {
  // Cấu hình CORS để cho phép Frontend gọi vào
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, message, donorName } = req.body;
    const orderId = `DH_${Date.now()}`;

    // Tạo Url thanh toán
    const checkoutURL = sepayClient.checkout.initCheckoutUrl();
    const paymentFields = sepayClient.checkout.initOneTimePaymentFields({
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderId,
      order_amount: amount,
      currency: 'VND',
      order_description: `Donate ${orderId}`,
      // Sau khi thanh toán xong, redirect về trang chủ kèm trạng thái
      success_url: `https://${req.headers.host}/?status=success`, 
      cancel_url: `https://${req.headers.host}/?status=cancel`,
    });

    // Lưu đơn hàng Pending vào Firebase
    await db.collection('donations_pending').doc(orderId).set({
      orderId,
      donorName: donorName || 'Ẩn danh',
      message: message || '',
      amount: parseInt(amount),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    const params = new URLSearchParams(paymentFields).toString();
    const fullUrl = `${checkoutURL}?${params}`;

    return res.status(200).json({ url: fullUrl, orderId });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
}
