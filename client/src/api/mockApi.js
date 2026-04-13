// client/src/api/mockApi.js

let products = [
  {
    id: 1,
    name: "Kitchen Cabinet",
    price: 120,
    stock_quantity: 10
  },
  {
    id: 2,
    name: "Wardrobe",
    price: 300,
    stock_quantity: 5
  }
];

let cart = [];

export const api = {
  // PRODUCTS
  getProducts: async () => products,

  // CART
  addToCart: async (product) => {
    cart.push(product);
    return cart;
  },

  getCart: async () => cart,

  // ORDERS
  checkout: async () => {
    const order = {
      id: Date.now(),
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0)
    };
    cart = [];
    return order;
  }
};