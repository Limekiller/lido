import path from 'path'
import fs from 'fs-extra'
import { prisma } from "@/lib/prisma"

import { DELETE as deleteDownload } from '../../download/[id]/route'
import { verifySession } from '@/lib/auth/lib'
import { getFileInfo } from '../../moviedata/metadata/route'

const mediaPath = path.join(process.cwd(), '/storage/')

export const deleteFile = async id => {
    const file = await prisma.file.findUnique({
        where: {
            id: id
        }
    })

    // Check if there are any other files that belong to this download
    // If not, delete the download
    const otherFiles = await prisma.file.findMany({
        where: {
            AND: [
                { downloadId: file.downloadId },
                { NOT: { id: id } }
            ]
        }
    })

    if (otherFiles.length === 0) {
        await prisma.download.delete({
            where: {
                id: file.downloadId
            }
        })
    }

    // Remove file from disk
    fs.removeSync(`${mediaPath}/${id}.${file.name.split('.').slice(-1)[0]}`)

    await prisma.file.delete({
        where: {id: id}
    })
}

export const DELETE = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        await deleteFile(id)

        return Response.json({
            result: "success",
        })
    }
)

export const PUT = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const data = await req.json()
        let newData = data

        // If we're updating the name, refetch the metadata
        if (data.name) {
            let metadata = await getFileInfo(data.name)
            metadata = JSON.stringify(metadata)
            newData.metadata = metadata
        }

        const newFile = await prisma.file.update({
            where: { id: id },
            data: newData
        })

        return Response.json({
            result: "success",
            data: newFile
        })
    }
)