import * as dotenv from 'dotenv';

dotenv.config();

export const config = () => ({
  API_VERSION: (process.env.API_VERSION as string) || 'v1',
  JWT_SECRET: process.env.JWT_SECRET as string,
  MAIL: process.env.MAIL as string,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD as string,
  URL: process.env.URL || 'http://localhost:3000',
  POSTGRES: {
    USERNAME: process.env.POSTGRES_USERNAME as string,
    PASSWORD: process.env.POSTGRES_PASSWORD as string,
    HOST: process.env.POSTGRES_HOST as string,
    PORT: process.env.POSTGRES_PORT,
    DATABASE: process.env.POSTGRES_DATABASE as string,
  },
});

export const CONFIG = config();
