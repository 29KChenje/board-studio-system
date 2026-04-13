import { env } from "../config/env.js";
import { sendgridNotifier } from "./notifications/sendgridNotifier.js";
import { simulatedNotifier } from "./notifications/simulatedNotifier.js";
import { twilioNotifier } from "./notifications/twilioNotifier.js";

const emailProviders = {
  simulated: simulatedNotifier,
  sendgrid: sendgridNotifier
};

const smsProviders = {
  simulated: simulatedNotifier,
  twilio: twilioNotifier
};

export const notificationService = {
  async sendOrderUpdate({ orderId, email, phone = "", message }) {
    const emailProvider = emailProviders[env.notifications.emailProvider] || simulatedNotifier;
    const smsProvider = smsProviders[env.notifications.smsProvider] || simulatedNotifier;

    const [emailResult, smsResult] = await Promise.all([
      email ? emailProvider.sendEmail({ orderId, to: email, subject: "Order Update", message }) : Promise.resolve(null),
      phone ? smsProvider.sendSms({ orderId, to: phone, message }) : Promise.resolve(null)
    ]);

    return { emailResult, smsResult };
  },

  async sendPaymentReceipt({ orderId, email, phone = "", referenceCode }) {
    const message = `Payment received for order ${orderId}. Reference: ${referenceCode}`;
    return notificationService.sendOrderUpdate({
      orderId,
      email,
      phone,
      message
    });
  }
};
