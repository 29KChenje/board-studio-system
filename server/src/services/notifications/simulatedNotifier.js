import fs from "fs";
import path from "path";

const notificationsDir = path.resolve(process.cwd(), "server", "logs");
fs.mkdirSync(notificationsDir, { recursive: true });
const notificationsFile = path.join(notificationsDir, "notifications.log");

const writeLog = (payload) => {
  fs.appendFileSync(notificationsFile, `${new Date().toISOString()} ${JSON.stringify(payload)}\n`);
};

export const simulatedNotifier = {
  async sendEmail(payload) {
    writeLog({ channel: "email", provider: "simulated", ...payload });
    return { delivered: true };
  },

  async sendSms(payload) {
    writeLog({ channel: "sms", provider: "simulated", ...payload });
    return { delivered: true };
  }
};
