// Import Firebase SDK (v10.12.2 matched from the chunks)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 1. Cấu hình Firebase (Trích xuất từ Webpack Chunk File 1 - Module 9171)
const firebaseConfig = {
    apiKey: "AIzaSyDC9e3zt2UCR71oQATpyy6rNe6n_a7JTPM",
    authDomain: "app.unich.com", // Lưu ý: Domain này có thể chặn localhost
    projectId: "unich-7e874",
    messagingSenderId: "361374750236",
    appId: "1:361374750236:web:be89b0735d3d7e8f30f1d9",
    measurementId: "G-5PK8EJTE8Z"
};

// 2. Khởi tạo App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginSection = document.getElementById('login-section');
const resultSection = document.getElementById('result-section');
const errorMsg = document.getElementById('error-msg');
const copyBtn = document.getElementById('copy-btn');

// --- HÀM XỬ LÝ ĐĂNG NHẬP ---
loginBtn.addEventListener('click', async () => {
    errorMsg.innerText = "";
    try {
        // Thực hiện đăng nhập Popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Lấy Token (Đây chính là AIRDROP_token cần tìm)
        const token = await user.getIdToken();
        
        showUserData(user, token);

    } catch (error) {
        console.error(error);
        if (error.code === 'auth/unauthorized-domain') {
            errorMsg.innerText = "Lỗi: Tên miền này (localhost) chưa được cấp quyền trên Firebase Console của Unich.";
        } else {
            errorMsg.innerText = `Lỗi: ${error.message}`;
        }
    }
});

// --- HÀM XỬ LÝ ĐĂNG XUẤT ---
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        loginSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorMsg.innerText = "";
    });
});

// --- HIỂN THỊ DỮ LIỆU ---
function showUserData(user, token) {
    // Ẩn login, hiện kết quả
    loginSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // Fill thông tin
    document.getElementById('user-photo').src = user.photoURL;
    document.getElementById('user-name').innerText = user.displayName;
    document.getElementById('user-email').innerText = user.email;
    document.getElementById('user-uid').value = user.uid;
    document.getElementById('access-token').value = token;
}

// --- COPY TOKEN ---
copyBtn.addEventListener('click', () => {
    const tokenArea = document.getElementById('access-token');
    tokenArea.select();
    document.execCommand('copy');
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy Token", 2000);
});
