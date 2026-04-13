import { db, createTimestamp, documentRef, getNextId } from "../config/db.js";

const mapSnapshot = (snapshot) => snapshot.data();

export const sortByCreatedDesc = (items) =>
  [...items].sort((left, right) => String(right.created_at || "").localeCompare(String(left.created_at || "")));

export const sortByIdAsc = (items) => [...items].sort((left, right) => Number(left.id) - Number(right.id));

export const listDocuments = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map(mapSnapshot);
};

export const getDocumentsByField = async (collectionName, field, value) => {
  const snapshot = await db.collection(collectionName).where(field, "==", value).get();
  return snapshot.docs.map(mapSnapshot);
};

export const findDocumentById = async (collectionName, id, transaction = null) => {
  const ref = documentRef(collectionName, id);
  const snapshot = transaction ? await transaction.get(ref) : await ref.get();
  return snapshot.exists ? snapshot.data() : null;
};

export const createDocument = async (collectionName, counterName, data, transaction = null) => {
  const id = await getNextId(counterName, transaction);
  const timestamp = createTimestamp();
  const payload = {
    id,
    ...data,
    created_at: timestamp,
    updated_at: timestamp
  };
  const ref = documentRef(collectionName, id);

  if (transaction) {
    transaction.set(ref, payload);
  } else {
    await ref.set(payload);
  }

  return payload;
};

export const updateDocument = async (collectionName, id, data, transaction = null) => {
  const ref = documentRef(collectionName, id);
  const payload = {
    ...data,
    updated_at: createTimestamp()
  };

  if (transaction) {
    transaction.set(ref, payload, { merge: true });
  } else {
    await ref.set(payload, { merge: true });
  }

  return findDocumentById(collectionName, id, transaction);
};

export const deleteDocument = async (collectionName, id, transaction = null) => {
  const ref = documentRef(collectionName, id);
  if (transaction) {
    transaction.delete(ref);
    return;
  }
  await ref.delete();
};
