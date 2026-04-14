export const sendgridNotifier = {
  async sendEmail(payload) {
    return {
      delivered: false,
      mode: "prepared",
      payload,
      message: "SendGrid provider structure is ready. Add the real API call with SENDGRID_API_KEY."
    };
  },

  async sendSms() {
    return { delivered: false, mode: "unsupported" };
  }
};
