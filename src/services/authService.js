import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const registerWithEmail = async ({ email, password, displayName }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  return credential.user;
};

export const loginWithEmail = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const logoutUser = () => signOut(auth);

export const sendPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email address is required to reset password.');
  }

  await sendPasswordResetEmail(auth, email);
};
