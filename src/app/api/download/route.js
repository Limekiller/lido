import { Transmission } from '@ctrl/transmission'
import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'

import libFunctions from '@/lib/lib'

const client = new Transmission({
    baseUrl: 'http://localhost:9091/',
    password: '',
})

export const POST = verifySession(
    async req => {
        const data = await req.json()

        const newDownload = await prisma.download.create({
            data: {
                name: data.name,
                categoryId: parseInt(data.category),
                state: 'downloading'
            }
        })

        let newTransDownload
        try {
            newTransDownload = await client.addMagnet(data.magnet, { 'download-dir': `${process.env.STORAGE_PATH}/temp/${newDownload.id}` })
        } catch (error) {
            await prisma.download.delete({
                where: {
                    id: newDownload.id
                }
            })

            return Response.json({
                result: "error",
                data: {
                    message: "The transmission-daemon service is not running.",
                }
            }, { status: 502 })
        }

        await prisma.download.update({
            where: {
                id: newDownload.id
            },
            data: {
                transmissionId: newTransDownload.arguments["torrent-added"].hashString
            }
        })

        return Response.json({
            result: "success",
            data: { download: newDownload, transDownload: newTransDownload }
        })
    }
)

export const GET = verifySession(
    async req => {
        let downloads = await prisma.download.findMany({
            include: {
                File: true
            }
        })

        for (const download of downloads) {
            for (const file of download.File) {
                const categoryTree = await libFunctions.getCategoryTree(file.categoryId)
                file.categoryTree = categoryTree
            }
        }

        let torrents
        try {
            torrents = await client.getAllData()
        } catch (error) {
            return Response.json({
                result: "error",
                data: {
                    message: "The transmission-daemon service is not running.",
                    downloads: {},
                    torrents: {},
                }
            }, { status: 502 })
        }

        torrents = Object.fromEntries(torrents.torrents.map(obj => [obj.id, obj]))

        return Response.json({
            result: "success",
            data: { downloads: downloads, torrents: torrents }
        })
    }
)