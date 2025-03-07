import path from 'path'
import fs from 'fs-extra'
import { prisma } from "@/lib/prisma"

import libFunctions from '@/lib/lib'
import { DELETE as deleteDownload } from '../../download/[id]/route'
import { verifySession } from '@/lib/auth/lib'
import { getFileInfo } from '../../moviedata/metadata/route'

export const deleteFile = async id => {
    const file = await prisma.file.findUnique({
        where: {
            id: id
        }
    })

    // Check if there are any children of this file, and if so, delete them
    let children = await prisma.file.findMany({
        where: {parentId: id}
    })
    for (const child of children) {
        deleteFile(child.id)
    }

    // Check if there are any other files that belong to this download
    // If not, delete the download
    let otherFiles = []
    if (file.downloadId) {
        otherFiles = await prisma.file.findMany({
            where: {
                AND: [
                    { downloadId: file.downloadId },
                    { NOT: { id: id } }
                ]
            }
        })
    }

    if (otherFiles.length === 0 && file.downloadId) {
        await prisma.download.delete({
            where: {
                id: file.downloadId
            }
        })
    } else {
        // Only explicitly delete this file if there ARE other existing files in this download,
        // because deleting the download cascades to the files automatically
        await prisma.file.delete({
            where: { id: id }
        })
    }

    // Remove file from disk
    fs.removeSync(`${process.env.STORAGE_PATH}/${file.area}/${id}.${file.name.split('.').slice(-1)[0]}`)
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

export const GET = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        const file = await prisma.file.findUnique({
            where: { id: id },
        })

        const fileExt = libFunctions.getFileExtFromMime(file.mimetype)

        const buffer = fs.readFileSync(`${process.env.STORAGE_PATH}/${file.area}/${file.id}.${fileExt}`)
        return new Response(buffer, {
            headers: {
                'content-type': file.mimetype
            }
        })
    }
)