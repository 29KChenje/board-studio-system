export const simulatedGateway = {
  async charge({ amount, method = "card", cardNumber, cardHolderName, currency }) {
    const cleanCardNumber = String(cardNumber || "").replace(/\s+/g, "");
    const eftStyleMethods = ["instant_eft", "capitec_pay", "payshap"];
    const approved =
      method === "cash" ||
      eftStyleMethods.includes(method) ||
      cleanCardNumber.endsWith("42") ||
      cleanCardNumber.endsWith("4242") ||
      cleanCardNumber === "";

    return {
      provider: "simulated",
      method,
      currency,
      status: approved ? "paid" : "failed",
      message: approved
        ? `Simulated payment approved for ${cardHolderName || "customer"}`
        : "Simulated payment declined. Use a test card ending in 42 or 4242.",
      providerResponse: {
        approved,
        maskedCard: cleanCardNumber ? `****${cleanCardNumber.slice(-4)}` : null
      },
      checkoutUrl: null,
      requiresRedirect: false
    };
  }
};
