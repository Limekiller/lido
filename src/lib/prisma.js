import { PrismaClient } from "../../prisma/generated/prisma/client"
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
}) 
const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
