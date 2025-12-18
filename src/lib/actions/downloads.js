"use server"

import { Transmission } from '@ctrl/transmission'
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { refresh } from 'next/cache'

import libFunctions from '@/lib/lib'

const client = new Transmission({
    baseUrl: 'http://localhost:9091/',
    password: '',
})

export const get = async () => {
    let downloads = await prisma.download.findMany({
        include: {
            File: true,
            User: true
        }
    })

    for (const download of downloads) {
        const downloadCategoryTree = await libFunctions.getCategoryTree(download.destinationCategory)
        download.categoryTree = downloadCategoryTree
        for (const file of download.File) {
            const categoryTree = await libFunctions.getCategoryTree(file.categoryId)
            file.categoryTree = categoryTree
        }
    }

    let torrents
    try {
        torrents = await client.getAllData()
    } catch (error) {
        return {
            result: "error",
            data: {
                message: "The transmission-daemon service is not running.",
                downloads: {},
                torrents: {},
            }
        }
    }

    torrents = Object.fromEntries(torrents.torrents.map(obj => [obj.id, obj]))

    return {
        result: "success",
        data: { downloads: downloads, torrents: torrents }
    }
}

export const create = async (name, category, magnet) => {
    const session = await getSession()

    const newDownload = await prisma.download.create({
        data: {
            name: name,
            destinationCategory: parseInt(category),
            state: 'downloading',
            userId: session.user.id === -1 ? null : session.user.id
        }
    })

    let newTransDownload
    try {
        newTransDownload = await client.addMagnet(magnet, { 'download-dir': `${process.env.STORAGE_PATH}/temp/${newDownload.id}` })
    } catch (error) {
        await prisma.download.delete({
            where: {
                id: newDownload.id
            }
        })

        return {
            result: "error",
            data: {
                message: "The transmission-daemon service is not running.",
            }
        }
    }

    await prisma.download.update({
        where: {
            id: newDownload.id
        },
        data: {
            transmissionId: newTransDownload.arguments["torrent-added"].hashString
        }
    })

    refresh()

    return {
        result: "success",
        data: { download: newDownload, transDownload: newTransDownload }
    }
}