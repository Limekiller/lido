"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, refresh } from "next/cache"

export const removeFromWatchLog = async (id, fileId) => {
    await prisma.WatchLog.deleteMany({
        where: {
            AND: [
                { fileId: fileId },
                { userId: id == -1 ? null : id }
            ]
        }
    })

    refresh()
    revalidatePath('/')
    return {
        result: "success",
    }
}

export const addToWatchLog = async (id, fileId) => {
    const createLog = await prisma.WatchLog.create({
        data: {
            fileId: fileId,
            userId: id == '-1' ? null : id
        }
    })

    return {
        result: "success",
        data: createLog
    }
}
