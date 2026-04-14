export const twilioNotifier = {
  async sendEmail() {
    return { delivered: false, mode: "unsupported" };
  },

  async sendSms(payload) {
    return {
      delivered: false,
      mode: "prepared",
      payload,
      message: "Twilio SMS structure is ready. Add the real API call with TWILIO credentials."
    };
  }
};
