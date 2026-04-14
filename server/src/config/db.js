import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.js";

const parseServiceAccount = () => {
  if (env.firebase.serviceAccountPath) {
    const filePath = resolve(env.firebase.serviceAccountPath);
    const rawServiceAccount = JSON.parse(readFileSync(filePath, "utf8"));
    return {
      projectId: rawServiceAccount.projectId || rawServiceAccount.project_id || env.firebase.projectId,
      clientEmail: rawServiceAccount.clientEmail || rawServiceAccount.client_email || env.firebase.clientEmail,
      privateKey: rawServiceAccount.privateKey || rawServiceAccount.private_key || env.firebase.privateKey
    };
  }

  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return {
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey
    };
  }

  return null;
};

const getCredential = () => {
  const serviceAccount = parseServiceAccount();
  if (serviceAccount) {
    return cert(serviceAccount);
  }

  try {
    return applicationDefault();
  } catch (error) {
    throw new Error(
      "Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_PATH to your service-account JSON file or populate FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server/.env."
    );
  }
};

const firebaseApp = (() => {
  if (getApps().length) {
    return getApps()[0];
  }

  const options = {
    projectId: env.firebase.projectId || undefined,
    databaseURL: env.firebase.databaseUrl || undefined,
    storageBucket: env.firebase.storageBucket || undefined,
    credential: getCredential()
  };

  return initializeApp(options);
})();

export const db = getFirestore(firebaseApp);

export const createTimestamp = () => new Date().toISOString();

const counterRef = (name) => db.collection("_counters").doc(String(name));

export const documentRef = (collectionName, id) => db.collection(collectionName).doc(String(id));

export const getNextId = async (counterName, transaction = null) => {
  const execute = async (tx) => {
    const counterState = tx.__counterState || new Map();
    tx.__counterState = counterState;
    const ref = counterRef(counterName);
    const snapshot = await tx.get(ref);
    const currentValue = snapshot.exists ? Number(snapshot.data().value || 0) : 0;
    const baseValue = counterState.has(counterName) ? counterState.get(counterName) : currentValue;
    const nextValue = baseValue + 1;
    counterState.set(counterName, nextValue);

    tx.set(
      ref,
      {
        value: nextValue,
        updated_at: createTimestamp()
      },
      { merge: true }
    );

    return nextValue;
  };

  if (transaction) {
    return execute(transaction);
  }

  return db.runTransaction((tx) => execute(tx));
};

export const withTransaction = async (callback) =>
  db.runTransaction(async (transaction) => callback(transaction));
