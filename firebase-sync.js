import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey:"AIzaSyCeyhQKKEnHXyGG0XpOoxP4Wp576eb8QFE",
  authDomain:"todaysell-d4bbc.firebaseapp.com",
  projectId:"todaysell-d4bbc",
  storageBucket:"todaysell-d4bbc.firebasestorage.app",
  messagingSenderId:"582095937004",
  appId:"1:582095937004:web:d1547c1e4d022e654074c9"
};

const db = getFirestore(initializeApp(firebaseConfig));
const appsRef = doc(db, 'cenon', 'apps');

export async function load() {
  const snapshot = await getDoc(appsRef);
  return snapshot.data()?.list ?? [];
}

export function update(change) {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(appsRef);
    const list = change(snapshot.data()?.list ?? []);
    transaction.set(appsRef, {list, updatedAt: Date.now()}, {merge: true});
    return list;
  });
}