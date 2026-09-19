import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './config';
import { UserProfile } from '../../types';

export function mapFirebaseError(error: any): string {
  const code = error?.code || '';
  const msg = error?.message || '';

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect password.';
  }
  if (code === 'auth/user-not-found') {
    return 'No account exists with this email.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/weak-password') {
    return 'Your password is too weak. (Minimum 6 characters)';
  }
  if (code === 'auth/network-request-failed') {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
    return 'Firebase authentication is not configured properly. Please check your Firebase credentials.';
  }

  if (msg && typeof msg === 'string') {
    return msg.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/.*\)\.?$/, '');
  }
  return 'Authentication failed. Please try again.';
}

export const authService = {
  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      return {
        id: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: cred.user.displayName || email.trim().split('@')[0] || 'EV Owner',
        propertyType: 'residential',
        costPriority: 'balanced',
        completedOnboarding: true,
      };
    } catch (e: any) {
      console.error('[AUTH SERVICE] SIGNIN FULL ERROR:', e);
      console.error('[AUTH SERVICE] SIGNIN ERROR CODE:', e?.code);
      console.error('[AUTH SERVICE] SIGNIN ERROR MESSAGE:', e?.message);
      throw new Error(mapFirebaseError(e));
    }
  },

  async signUp(email: string, password: string, name: string): Promise<UserProfile> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name && cred.user) {
        try {
          await updateProfile(cred.user, { displayName: name.trim() });
        } catch {
          // ignore profile display name set failure if auth succeeds
        }
      }
      return {
        id: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: name.trim() || cred.user.displayName || 'EV Owner',
        propertyType: 'residential',
        costPriority: 'balanced',
        completedOnboarding: false,
      };
    } catch (e: any) {
      console.error('[AUTH SERVICE] SIGNUP FULL ERROR:', e);
      console.error('[AUTH SERVICE] SIGNUP ERROR CODE:', e?.code);
      console.error('[AUTH SERVICE] SIGNUP ERROR MESSAGE:', e?.message);
      throw new Error(mapFirebaseError(e));
    }
  },

  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch (e: any) {
      throw new Error(mapFirebaseError(e));
    }
  },

  onUserChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
