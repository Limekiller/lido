import path from 'path'
import { Transmission } from '@ctrl/transmission'
import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'

const mediaPath = path.join(process.cwd(), '/storage/')
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
                categoryId: data.category,
                state: 'downloading'
            }
        })

        let newTransDownload
        try {
            newTransDownload = await client.addMagnet(data.magnet, { 'download-dir': mediaPath + 'temp/' + newDownload.id })
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
            }, {status: 502})
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
        const downloads = await prisma.download.findMany()

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
            }, {status: 502})
        }

        torrents = Object.fromEntries(torrents.torrents.map(obj => [obj.id, obj]))

        return Response.json({
            result: "success",
            data: { downloads: downloads, torrents: torrents }
        })
    }
)