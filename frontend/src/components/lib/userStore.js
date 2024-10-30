import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) {
      console.log("No UID provided, setting currentUser to null");
      return set({ currentUser: null, isLoading: false });
    }
    try {
      console.log(`Fetching user info for UID: ${uid}`);
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("User data found:", docSnap.data());
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        console.log("No user data found, setting currentUser to null");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log("Error fetching user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
