import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient()
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
