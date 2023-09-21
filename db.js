import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn", "info"],
      errorFormat: "pretty",
    });
  }
  prisma = global.prisma;
}

export default prisma;
