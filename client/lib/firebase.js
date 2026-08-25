import { initializeApp, getApps } from 'firebase/app'

import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  sendEmailVerification,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail
} from 'firebase/auth'

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBHh5EjctfR4xSovPYya0hwJo29tAW_1t8",
  authDomain: "ai-resume-6d715.firebaseapp.com",
  projectId: "ai-resume-6d715",
  storageBucket: "ai-resume-6d715.firebasestorage.app",
  messagingSenderId: "264415729067",
  appId: "1:264415729067:web:93e05572c1253f866d6eee",
  measurementId: "G-9LRDBC5EE8"
}

// Check Missing Config
const missingFirebaseEnv = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingFirebaseEnv.length > 0) {
  console.warn(
    'Missing Firebase environment variables:',
    missingFirebaseEnv.join(', ')
  )
}

// Initialize Firebase
const app =
  getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)

// Firebase Auth
export const auth = getAuth(app)

// ===============================
// GOOGLE PROVIDER
// ===============================

export const googleProvider =
  new GoogleAuthProvider()

googleProvider.addScope('profile')

googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// ===============================
// MICROSOFT PROVIDER
// ===============================

export const microsoftProvider =
  new OAuthProvider('microsoft.com')

microsoftProvider.setCustomParameters({
  prompt: 'select_account'
})

// ===============================
// EXPORTS
// ===============================

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  sendEmailVerification,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail
}