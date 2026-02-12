// api/ipn.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}
const db = admin.firestore();

module.exports = async (req, res) => {
    // SePay gửi thông tin qua body (JSON)
    const data = req.body; 

    /* Cấu trúc data SePay gửi về:
    {
      gateway: "MBBank",
      transactionDate: "2023-10-20 20:00:00",
      accountNumber: "...",
      subAccount: null,
      transferAmount: 10000,
      transferType: "in",
      content: "DONATE_169...",
      referenceCode: "...",
      description: "..."
    }
    */

    console.log("IPN Received:", data);

    try {
        // Tìm mã đơn hàng trong nội dung chuyển khoản (Ví dụ: DONATE_169777...)
        const content = data.content || "";
        const match = content.match(/(DONATE_\d+)/);
        
        if (match) {
            const orderId = match[1];
            
            // Cập nhật trạng thái trong Firebase
            const docRef = db.collection('donations').doc(orderId);
            const doc = await docRef.get();

            if (doc.exists) {
                await docRef.update({
                    status: 'success',
                    paymentData: data,
                    paidAt: new Date().toISOString()
                });
                
                // Tùy chọn: Cộng tiền donate vào thống kê tổng
                await db.collection('profile_data').doc('main').update({
                    total_donation: admin.firestore.FieldValue.increment(data.transferAmount)
                });
            }
        }

        // Bắt buộc trả về JSON success: true
        res.status(200).json({ success: true, message: "IPN Success" });

    } catch (error) {
        console.error("IPN Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
