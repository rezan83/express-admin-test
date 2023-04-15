import { config } from 'dotenv';

config();

const env = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI
};

export default env;
