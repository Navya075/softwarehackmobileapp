import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { VehicleProfile, ChargingPreferences, NotificationItem } from '../../types';

// Collection references matching the architectural spec
export const COLLECTIONS = {
  USERS: 'users',
  VEHICLES: 'vehicles',
  CHARGING_PREFERENCES: 'chargingPreferences',
  CHARGING_SESSIONS: 'chargingSessions',
  CHARGING_PLANS: 'chargingPlans',
  NOTIFICATIONS: 'notifications',
  CHARGERS: 'chargers',
  RESERVATIONS: 'reservations',
  CHARGING_HISTORY: 'chargingHistory',
  BILLING: 'billing',
  CARBON_REPORTS: 'carbonReports',
  TRIPS: 'trips',
} as const;

export const firestoreService = {
  // Save or update user profile
  async saveUserProfile(userId: string, data: any) {
    if (!isFirebaseConfigured) return;
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, data, { merge: true });
  },

  // Save or update vehicle
  async saveVehicle(userId: string, vehicle: VehicleProfile) {
    if (!isFirebaseConfigured) return;
    const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicle.id);
    await setDoc(vehicleRef, { ...vehicle, userId, updatedAt: new Date().toISOString() });
  },

  // Save charging preferences
  async savePreferences(userId: string, prefs: any) {
    if (!isFirebaseConfigured) return;
    const prefRef = doc(db, COLLECTIONS.CHARGING_PREFERENCES, userId);
    await setDoc(prefRef, { ...prefs, userId, updatedAt: new Date().toISOString() });
  },

  // Record completed session history (avoid high frequency real-time writes here!)
  async logCompletedSession(session: any) {
    if (!isFirebaseConfigured) return;
    const sessionRef = doc(collection(db, COLLECTIONS.CHARGING_HISTORY));
    await setDoc(sessionRef, { ...session, createdAt: new Date().toISOString() });
  },

  // Store persistent notifications
  async saveNotification(userId: string, notification: NotificationItem) {
    if (!isFirebaseConfigured) return;
    const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
    await setDoc(notifRef, { ...notification, userId });
  }
};
