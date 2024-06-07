import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // log: ["query", "error", "warn", "info"],
      log: ["error"],
      errorFormat: "pretty",
    });
  }
  prisma = global.prisma;
}

//const prisma = new PrismaClient();

export default prisma;
