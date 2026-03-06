import dotenv from "dotenv";

dotenv.config();

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: must("JWT_SECRET"),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
};

