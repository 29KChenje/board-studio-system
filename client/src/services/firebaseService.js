// client/src/services/firebaseService.js

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
         firebaseConfig.apiKey !== "demo-api-key" &&
         firebaseConfig.apiKey !== "your-api-key-here" &&
         firebaseConfig.projectId &&
         firebaseConfig.projectId !== "demo-project" &&
         firebaseConfig.projectId !== "your-project-id";
};

// For now, using mock data. To enable Firebase:
// 1. Uncomment the Firebase imports below
// 2. Implement Firebase functions
// 3. Remove mock fallbacks

// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// let firebaseApp = null;
// let db = null;
// let auth = null;

// const initializeFirebase = async () => {
//   if (!isFirebaseConfigured()) return false;
//   if (firebaseApp) return true;

//   try {
//     firebaseApp = initializeApp(firebaseConfig);
//     db = getFirestore(firebaseApp);
//     auth = getAuth(firebaseApp);
//     return true;
//   } catch (error) {
//     console.warn('Firebase initialization failed:', error.message);
//     return false;
//   }
// };

// Mock data fallback
const mockProducts = [
  {
    id: '1',
    name: 'Kitchen Cabinet',
    description: 'Custom kitchen cabinet',
    category: 'Cabinets',
    price: 120,
    stock_quantity: 10,
    is_active: true,
    image_url: null
  },
  {
    id: '2',
    name: 'Wardrobe',
    description: 'Spacious wardrobe',
    category: 'Storage',
    price: 300,
    stock_quantity: 5,
    is_active: true,
    image_url: null
  }
];

let mockCart = [];
let mockOrders = [];
let mockProjects = [];

// Helper function to check if Firebase is available
const isFirebaseAvailable = () => {
  return false; // Set to true when Firebase is properly configured
};

// Auth functions
export const login = async (email, password) => {
  if (!isFirebaseAvailable()) {
    // Mock login
    if (email === 'admin@example.com' && password === 'password') {
      return { user: { uid: 'admin', email, role: 'admin' }, token: 'mock-token' };
    }
    if (email === 'user@example.com' && password === 'password') {
      return { user: { uid: 'user', email, role: 'user' }, token: 'mock-token' };
    }
    throw new Error('Invalid credentials');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const token = await user.getIdToken();
  return { user: { uid: user.uid, email: user.email }, token };
};

export const register = async (email, password, additionalData = {}) => {
  if (!isFirebaseAvailable()) {
    // Mock register
    return { user: { uid: 'new-user', email, ...additionalData }, token: 'mock-token' };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const token = await user.getIdToken();
  return { user: { uid: user.uid, email: user.email, ...additionalData }, token };
};

export const logout = async () => {
  if (!isFirebaseAvailable()) {
    return;
  }
  await signOut(auth);
};

export const onAuthStateChange = (callback) => {
  if (!isFirebaseAvailable()) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Products functions
export const getProducts = async (filters = {}) => {
  if (!isFirebaseAvailable()) {
    let products = [...mockProducts];
    if (filters.search) {
      products = products.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    return { products, categories: ['Cabinets', 'Storage'] };
  }

  const productsRef = collection(db, 'products');
  let q = query(productsRef, where('is_active', '==', true));

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  const querySnapshot = await getDocs(q);
  let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  // Get categories
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const categories = categoriesSnapshot.docs.map(doc => doc.data().name);

  return { products, categories };
};

export const createProduct = async (productData) => {
  if (!isFirebaseAvailable()) {
    const newProduct = { ...productData, id: Date.now().toString() };
    mockProducts.push(newProduct);
    return newProduct;
  }

  const docRef = await addDoc(collection(db, 'products'), productData);
  return { id: docRef.id, ...productData };
};

export const updateProduct = async (id, productData) => {
  if (!isFirebaseAvailable()) {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return mockProducts[index];
    }
    throw new Error('Product not found');
  }

  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, productData);
  return { id, ...productData };
};

export const deleteProduct = async (id) => {
  if (!isFirebaseAvailable()) {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return;
    }
    throw new Error('Product not found');
  }

  await deleteDoc(doc(db, 'products', id));
};

// Cart functions
export const getCart = async (userId) => {
  if (!isFirebaseAvailable()) {
    return { items: mockCart, summary: { totalItems: mockCart.length, subtotal: mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0) } };
  }

  const cartRef = collection(db, 'carts');
  const q = query(cartRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return { items: [], summary: { totalItems: 0, subtotal: 0 } };
  }

  const cartDoc = querySnapshot.docs[0];
  const items = cartDoc.data().items || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { items, summary: { totalItems, subtotal } };
};

export const addToCart = async (userId, productId, quantity = 1) => {
  if (!isFirebaseAvailable()) {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const existingItem = mockCart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      mockCart.push({ ...product, productId, quantity });
    }
    return mockCart;
  }

  const cartRef = collection(db, 'carts');
  const q = query(cartRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  let cartDocRef;
  let items = [];

  if (querySnapshot.empty) {
    cartDocRef = await addDoc(collection(db, 'carts'), { userId, items: [] });
  } else {
    cartDocRef = querySnapshot.docs[0].ref;
    items = querySnapshot.docs[0].data().items || [];
  }

  const existingItem = items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) throw new Error('Product not found');
    const product = { id: productDoc.id, ...productDoc.data() };
    items.push({ ...product, productId, quantity });
  }

  await updateDoc(cartDocRef, { items });
  return items;
};

export const updateCartItem = async (userId, itemId, quantity) => {
  if (!isFirebaseAvailable()) {
    const item = mockCart.find(item => item.id === itemId);
    if (!item) throw new Error('Item not found');
    item.quantity = quantity;
    return mockCart;
  }

  const cartRef = collection(db, 'carts');
  const q = query(cartRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error('Cart not found');

  const cartDoc = querySnapshot.docs[0];
  const items = cartDoc.data().items || [];
  const item = items.find(item => item.id === itemId);
  if (!item) throw new Error('Item not found');

  item.quantity = quantity;
  await updateDoc(cartDoc.ref, { items });
  return items;
};

export const removeCartItem = async (userId, itemId) => {
  if (!isFirebaseAvailable()) {
    mockCart = mockCart.filter(item => item.id !== itemId);
    return mockCart;
  }

  const cartRef = collection(db, 'carts');
  const q = query(cartRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error('Cart not found');

  const cartDoc = querySnapshot.docs[0];
  const items = cartDoc.data().items || [];
  const filteredItems = items.filter(item => item.id !== itemId);

  await updateDoc(cartDoc.ref, { items: filteredItems });
  return filteredItems;
};

// Orders functions
export const createOrder = async (userId, orderData) => {
  if (!isFirebaseAvailable()) {
    const cart = await getCart(userId);
    const order = {
      id: Date.now().toString(),
      userId,
      items: cart.items,
      total: cart.summary.subtotal,
      status: 'pending',
      ...orderData,
      createdAt: new Date()
    };
    mockOrders.push(order);
    mockCart = []; // Clear cart
    return order;
  }

  const cart = await getCart(userId);
  const order = {
    userId,
    items: cart.items,
    total: cart.summary.subtotal,
    status: 'pending',
    ...orderData,
    createdAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'orders'), order);

  // Clear cart
  const cartRef = collection(db, 'carts');
  const q = query(cartRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    await updateDoc(querySnapshot.docs[0].ref, { items: [] });
  }

  return { id: docRef.id, ...order };
};

export const getUserOrders = async (userId) => {
  if (!isFirebaseAvailable()) {
    return mockOrders.filter(order => order.userId === userId);
  }

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllOrders = async () => {
  if (!isFirebaseAvailable()) {
    return mockOrders;
  }

  const querySnapshot = await getDocs(collection(db, 'orders'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateOrderStatus = async (orderId, status) => {
  if (!isFirebaseAvailable()) {
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    return order;
  }

  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status });
  const updatedDoc = await getDoc(orderRef);
  return { id: orderId, ...updatedDoc.data() };
};

// Projects functions
export const getUserProjects = async (userId) => {
  if (!isFirebaseAvailable()) {
    return mockProjects.filter(project => project.userId === userId);
  }

  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createProject = async (userId, projectData) => {
  if (!isFirebaseAvailable()) {
    const project = { id: Date.now().toString(), userId, ...projectData };
    mockProjects.push(project);
    return project;
  }

  const docRef = await addDoc(collection(db, 'projects'), { userId, ...projectData });
  return { id: docRef.id, userId, ...projectData };
};

export const getProject = async (projectId) => {
  if (!isFirebaseAvailable()) {
    return mockProjects.find(p => p.id === projectId);
  }

  const projectDoc = await getDoc(doc(db, 'projects', projectId));
  if (!projectDoc.exists()) throw new Error('Project not found');
  return { id: projectDoc.id, ...projectDoc.data() };
};

// Admin functions
export const getAdminDashboard = async () => {
  if (!isFirebaseAvailable()) {
    return {
      analytics: {
        totalProducts: mockProducts.length,
        totalOrders: mockOrders.length,
        totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0)
      }
    };
  }

  // This would require aggregation queries, simplified for demo
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const ordersSnapshot = await getDocs(collection(db, 'orders'));

  const totalProducts = productsSnapshot.size;
  const totalOrders = ordersSnapshot.size;
  const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

  return {
    analytics: {
      totalProducts,
      totalOrders,
      totalRevenue
    }
  };
};

export const getSystemHealth = async () => {
  if (!isFirebaseAvailable()) {
    return { status: 'mock', uptime: 1000 };
  }

  // Simplified system health
  return { status: 'healthy', uptime: Date.now() };
};