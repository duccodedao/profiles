import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLCcgaoW9gNYhKk0c0gDWC6i5mKVTN4XE",
  authDomain: "profile-d1214.firebaseapp.com",
  projectId: "profile-d1214",
  storageBucket: "profile-d1214.firebasestorage.app",
  messagingSenderId: "914980131889",
  appId: "1:914980131889:web:72f8da15c42dbee671b110",
  measurementId: "G-C587M69LZW"
};

import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { AppUser, Transaction } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ADMIN_EMAIL = 'sonlyhongduc@gmail.com';

export const createOrUpdateUser = async (user: User, referralCodeInput?: string) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  let lastIp = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    lastIp = data.ip;
  } catch (e) {
    console.warn('IP fetch failed');
  }

  let deviceId = localStorage.getItem('app_device_id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('app_device_id', deviceId);
  }
  
  if (!snap.exists()) {
    // New user
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    let inviterUid = '';
    let newUserBalance = 0;

    const batch = writeBatch(db);

    if (referralCodeInput) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCodeInput.trim().toUpperCase()));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const inviterDoc = querySnap.docs[0];
        inviterUid = inviterDoc.id;
        
        // Reward Inviter with 5,000 VND
        const rewardInviter = 5000;
        const rewardInvitee = 1000;
        
        batch.update(doc(db, 'users', inviterUid), {
          balance: increment(rewardInviter),
          totalEarned: increment(rewardInviter),
          referralsCount: increment(1)
        });

        // Log Referral Transaction for Inviter
        const transInviterRef = doc(collection(db, 'transactions'));
        batch.set(transInviterRef, {
          userId: inviterUid,
          amount: rewardInviter,
          type: 'referral',
          description: `Thưởng giới thiệu thành viên mới: ${user.email}`,
          createdAt: serverTimestamp()
        });

        // Reward Invitee with 1,000 VND
        // We'll set the balance directly in the newUser object later or via update
        newUserBalance = rewardInvitee;
      }
    }
    
    const newUser: AppUser = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
      invitedBy: inviterUid,
      referralCode: userReferralCode,
      isVerified: false,
      balance: newUserBalance,
      totalEarned: newUserBalance,
      referralsCount: 0,
      createdAt: serverTimestamp(),
      lastIp,
      deviceId
    };

    if (newUserBalance > 0) {
      const transInviteeRef = doc(collection(db, 'transactions'));
      batch.set(transInviteeRef, {
        userId: user.uid,
        amount: newUserBalance,
        type: 'referral',
        description: `Thưởng nhập mã giới thiệu từ: ${referralCodeInput}`,
        createdAt: serverTimestamp()
      });
    }
    
    batch.set(userRef, newUser);
    await batch.commit();
    return newUser;
  } else {
    // Sync update
    await updateDoc(userRef, {
      lastIp,
      deviceId,
      photoURL: user.photoURL || '',
      displayName: user.displayName || ''
    });
    return snap.data() as AppUser;
  }
};

export const distributeCommission = async (userId: string, earnAmount: number, description: string) => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data() as AppUser;
  if (userData.invitedBy) {
    const commission = Math.floor(earnAmount * 0.1);
    const inviterRef = doc(db, 'users', userData.invitedBy);
    
    const batch = writeBatch(db);
    batch.update(inviterRef, {
      balance: increment(commission),
      totalEarned: increment(commission)
    });

    const transRef = doc(collection(db, 'transactions'));
    batch.set(transRef, {
      userId: userData.invitedBy,
      amount: commission,
      type: 'commission',
      description: `10% Huê hồng từ ${userData.displayName}: ${description}`,
      createdAt: serverTimestamp()
    });
    
    await batch.commit();
  }
};

export const trackProjectClick = async (projectId: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      clicks: increment(1)
    });
  } catch (err) {
    console.error('Error tracking click:', err);
  }
};
