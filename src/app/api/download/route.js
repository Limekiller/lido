import { Transmission } from '@ctrl/transmission'
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { verifySession } from '@/lib/auth/lib'

import libFunctions from '@/lib/lib'

import { create } from '@/lib/actions/downloads'

const client = new Transmission({
    baseUrl: 'http://localhost:9091/',
    password: '',
})

export const POST = verifySession(
    async req => {
        const data = await req.json()
        const newDownloadResult = await create(data.name, data.category, data.magnet)
        return newDownloadResult
    }
)

export const GET = verifySession(
    async req => {
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