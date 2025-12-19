"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, refresh } from "next/cache"

export const removeFromWatchLog = async (id, fileId) => {
    // Remove all items from watch log that share a download id with this file
    const file = await prisma.file.findFirst({
        where: {
            id: fileId
        }
    })
    const downloadId = file.downloadId
    const sisterFiles = await prisma.file.findMany({
        where: {
            downloadId: downloadId,
            area: 'video'
        }
    })
    const fileIds = sisterFiles.map(file => file.id)
    await prisma.WatchLog.deleteMany({
        where: {
            fileId: {
                in: fileIds
            },
            userId: id == -1 ? null : id
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
