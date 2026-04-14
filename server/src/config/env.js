import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    databaseUrl: process.env.FIREBASE_DATABASE_URL || ""
  },
  defaults: {
    boardWidth: toNumber(process.env.DEFAULT_BOARD_WIDTH, 2750),
    boardHeight: toNumber(process.env.DEFAULT_BOARD_HEIGHT, 1830),
    cutCostPerPiece: toNumber(process.env.CUT_COST_PER_PIECE, 12),
    edgeCostPerMeter: toNumber(process.env.EDGE_COST_PER_METER, 8.5),
    boardCostPerSheet: toNumber(process.env.BOARD_COST_PER_SHEET, 950)
  },
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  payment: {
    provider: process.env.PAYMENT_PROVIDER || "simulated",
    currency: process.env.PAYMENT_CURRENCY || "ZAR",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || ""
  },
  notifications: {
    provider: process.env.NOTIFICATION_PROVIDER || "simulated",
    emailProvider: process.env.EMAIL_PROVIDER || "simulated",
    smsProvider: process.env.SMS_PROVIDER || "simulated",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || ""
  },
  backupDir: process.env.BACKUP_DIR || "backups",
  southAfricaPayments: {
    bankName: process.env.SA_BANK_NAME || "FNB",
    accountName: process.env.SA_ACCOUNT_NAME || "Board Studio System",
    accountNumber: process.env.SA_ACCOUNT_NUMBER || "62000000000",
    branchCode: process.env.SA_BRANCH_CODE || "250655",
    accountType: process.env.SA_ACCOUNT_TYPE || "Business Cheque",
    referencePrefix: process.env.SA_REFERENCE_PREFIX || "BSTUDIO"
  }
};
