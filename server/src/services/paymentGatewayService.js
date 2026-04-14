import crypto from "crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { paystackGateway } from "./payments/paystackGateway.js";
import { simulatedGateway } from "./payments/simulatedGateway.js";
import { stripeGateway } from "./payments/stripeGateway.js";

const gateways = {
  simulated: simulatedGateway,
  stripe: stripeGateway,
  paystack: paystackGateway
};

const buildReference = () => `PAY-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

export const paymentGatewayService = {
  async charge(payload) {
    const provider = env.payment.provider;
    const gateway = gateways[provider];

    if (!gateway) {
      throw new ApiError(500, `Unsupported payment provider: ${provider}`);
    }

    const result = await gateway.charge({
      ...payload,
      currency: env.payment.currency
    });

    return {
      referenceCode: buildReference(),
      amount: Number(payload.amount),
      ...result
    };
  },

  buildSouthAfricaBankDetails(orderId) {
    return {
      bankName: env.southAfricaPayments.bankName,
      accountName: env.southAfricaPayments.accountName,
      accountNumber: env.southAfricaPayments.accountNumber,
      branchCode: env.southAfricaPayments.branchCode,
      accountType: env.southAfricaPayments.accountType,
      paymentReference: `${env.southAfricaPayments.referencePrefix}-${orderId}`
    };
  }
};
