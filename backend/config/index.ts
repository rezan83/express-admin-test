import { config } from 'dotenv';

config();

const env = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI,
  JWT_PRIVATE: process.env.JWT_PRIVATE || "brown fox",
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_USER: process.env.MAIL_USER,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3001/',
  SESSION_SEC: process.env.SESSION_SEC || 'gsjlacmcnkjdscnjdsh88'
};

export default env;
