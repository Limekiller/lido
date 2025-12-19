"use server"

import { Transmission } from '@ctrl/transmission'
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { refresh } from 'next/cache'
import fs from 'fs-extra'

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

export const details = async id => {
    const download = await prisma.download.findUnique({
        where: {
            id: id
        },
        include: {
            file: true
        }
    })

    refresh()
    return {
        result: "success",
        data: download
    }
}

export const update = async (id, data) => {
    let download = await prisma.download.update({
        where: {
            id: id
        },
        data: data
    })

    if (data.state) {
        switch (data.state) {
            case "paused":
                await client.pauseTorrent(download.transmissionId)
                break;
            case "downloading":
                await client.resumeTorrent(download.transmissionId)
                break;
            default:
                console.log('No state matched')
        }
    }

    return {
        result: "success",
        data: download
    }
}


export const delete_ = async id => {
    // Delete all files related to this download
    // The records are removed automatically when the parent dl is deleted
    const files = await prisma.file.findMany({
        where: {
            downloadId: id
        }
    })
    for (const file of files) {
        fs.removeSync(`${process.env.STORAGE_PATH}/${file.area}/${file.id}.${file.name.split('.').slice(-1)[0]}`)
    }

    // Remove the torrent, if it exists
    const download = await prisma.download.findUnique({
        where: {
            id: id
        }
    })
    await client.removeTorrent(download.transmissionId, true)
    fs.rmSync(`${process.env.STORAGE_PATH}/temp/${id}`, {recursive: true, force: true})

    // Finally delete the download
    await prisma.download.delete({
        where: {
            id: id
        }
    })

    refresh()
    return {
        result: "success",
    }
}
