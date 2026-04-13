export const stripeGateway = {
  async charge({ amount, method, currency }) {
    return {
      provider: "stripe",
      method,
      currency,
      status: "authorized",
      message: "Stripe gateway structure is ready. Add live API calls to create a PaymentIntent.",
      providerResponse: {
        mode: "prepared",
        amount
      },
      checkoutUrl: null,
      requiresRedirect: false
    };
  }
};
