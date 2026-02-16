// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const adapter = new PrismaMssql({
  server: process.env.SQL_SERVER!,
  port: 1433,
  database: process.env.SQL_DATABASE!,
  user: process.env.SQL_USER!,        // same as in DATABASE_URL
  password: process.env.SQL_PASSWORD!,// same as in DATABASE_URL
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
