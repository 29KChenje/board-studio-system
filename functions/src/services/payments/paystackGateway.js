export const paystackGateway = {
  async charge({ amount, method, currency }) {
    return {
      provider: "paystack",
      method,
      currency,
      status: "authorized",
      message: "Paystack gateway structure is ready. Add live transaction initialization using the secret key.",
      providerResponse: {
        mode: "prepared",
        amount
      },
      checkoutUrl: null,
      requiresRedirect: false
    };
  }
};
