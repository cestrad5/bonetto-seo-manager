import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClddDCBEYCb0fR9Gq3CZIVT-qqjKBUq2g",
  authDomain: "bonetto-seo-manager.firebaseapp.com",
  projectId: "bonetto-seo-manager",
  storageBucket: "bonetto-seo-manager.firebasestorage.app",
  messagingSenderId: "297676674852",
  appId: "1:297676674852:web:aec8b8bbebde27ea4ec5b1"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
