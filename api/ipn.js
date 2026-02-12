const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {}
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST');

  try {
    const data = req.body;
    console.log("IPN Received:", data);

    // Lưu lịch sử giao dịch thành công vào Firebase
    await db.collection('donations_success').add({
      ...data,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'IPN Error' });
  }
}
