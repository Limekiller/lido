import path from 'path'
import fs from 'fs-extra'
import { prisma } from "@/lib/prisma"
import { Transmission } from '@ctrl/transmission'
import { verifySession } from '@/lib/auth/lib'

const mediaPath = path.join(process.cwd(), '/storage/')
const client = new Transmission({
    baseUrl: 'http://localhost:9091/',
    password: '',
})

export const GET = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        const download = await prisma.download.findUnique({
            where: {
                id: id
            }
        })

        return Response.json({
            result: "success",
            data: download
        })
    }
)

export const PUT = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const data = await req.json()

        let download
        switch (data.action) {
            case "pause":
                download = await prisma.download.update({
                    where: {
                        id: id
                    },
                    data: {
                        state: "paused"
                    }
                })
                await client.pauseTorrent(download.transmissionId)
                break;
            case "resume":
                download = await prisma.download.update({
                    where: {
                        id: id
                    },
                    data: {
                        state: "downloading"
                    }
                })
                await client.resumeTorrent(download.transmissionId)
                break;
            default:
                console.log('No action specified')
        }

        return Response.json({
            result: "success",
            data: download
        })
    }
)

export const DELETE = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        // Delete all files related to this download
        // The records are removed automatically when the parent dl is deleted
        const files = await prisma.file.findMany({
            where: {
                downloadId: id
            }
        })
        for (const file of files) {
            fs.removeSync(`${mediaPath}/${file.id}.${file.name.split('.').slice(-1)[0]}`)
        }
        fs.rmSync(`${mediaPath}/temp/${id}`, {recursive: true, force: true})

        // Remove the torrent, if it exists
        const download = await prisma.download.findUnique({
            where: {
                id: id
            }
        })
        await client.removeTorrent(download.transmissionId, true)

        // Finally delete the download
        await prisma.download.delete({
            where: {
                id: id
            }
        })

        return Response.json({
            result: "success",
        })
    }
)