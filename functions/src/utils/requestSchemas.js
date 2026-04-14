export const authSchemas = {
  register: {
    body: {
      name: { required: true, type: "string" },
      email: { required: true, type: "string" },
      password: { required: true, type: "string" }
    }
  },
  login: {
    body: {
      email: { required: true, type: "string" },
      password: { required: true, type: "string" }
    }
  }
};

export const projectSchemas = {
  create: {
    body: {
      name: { required: true, type: "string" },
      width: { required: true, type: "number", positive: true },
      height: { required: true, type: "number", positive: true },
      depth: { required: true, type: "number", positive: true }
    }
  },
  byId: {
    params: {
      id: { required: true, type: "integer", min: 1 }
    }
  }
};

export const pieceSchemas = {
  create: {
    body: {
      projectId: { required: true, type: "integer", min: 1 }
    }
  },
  byProject: {
    params: {
      projectId: { required: true, type: "integer", min: 1 }
    }
  }
};

export const orderSchemas = {
  workshop: {
    body: {
      projectId: { required: true, type: "integer", min: 1 }
    }
  },
  checkout: {
    body: {
      shippingName: { required: true, type: "string" },
      shippingEmail: { required: true, type: "string" },
      shippingAddress: { required: true, type: "string" },
      paymentMethod: { enum: ["card", "cash", "manual_eft", "instant_eft", "capitec_pay", "payshap"] }
    }
  },
  updateStatus: {
    params: {
      id: { required: true, type: "integer", min: 1 }
    },
    body: {
      status: { required: true, enum: ["pending", "awaiting_payment_confirmation", "quoted", "approved", "in_production", "completed"] }
    }
  },
  uploadProof: {
    params: {
      id: { required: true, type: "integer", min: 1 }
    },
    body: {
      paymentId: { required: true, type: "integer", min: 1 }
    }
  },
  verifyPayment: {
    params: {
      id: { required: true, type: "integer", min: 1 }
    },
    body: {
      paymentId: { required: true, type: "integer", min: 1 }
    }
  }
};

export const productSchemas = {
  create: {
    body: {
      name: { required: true, type: "string" },
      price: { required: true, type: "number", positive: true },
      stockQuantity: { required: true, type: "integer", min: 0 }
    }
  },
  update: {
    params: {
      id: { required: true, type: "integer", min: 1 }
    }
  }
};

export const cartSchemas = {
  addItem: {
    body: {
      productId: { required: true, type: "integer", min: 1 },
      quantity: { required: true, type: "integer", min: 1 }
    }
  },
  updateItem: {
    params: {
      itemId: { required: true, type: "integer", min: 1 }
    },
    body: {
      quantity: { required: true, type: "integer", min: 1 }
    }
  },
  removeItem: {
    params: {
      itemId: { required: true, type: "integer", min: 1 }
    }
  }
};
