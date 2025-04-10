import fs from 'fs-extra'
import path from 'path'

import libFunctions from '@/lib/lib'
import { getSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'

async function* nodeStreamToIterator(stream) {
    for await (const chunk of stream) {
        yield new Uint8Array(chunk)
    }
}

const iteratorToStream = iterator => {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next()
            if (done) {
                controller.close()
            } else {
                controller.enqueue(value)
            }
        }
    })
}

const streamFile = (path, start, end) => {
    const nodeStream = fs.createReadStream(path, { start, end })
    const data = iteratorToStream(nodeStreamToIterator(nodeStream))
    return data
}

export const GET = async (req, { params }) => {
    const searchParams = req.nextUrl.searchParams
    params = await params

    let room
    if (searchParams.has('room')) {
        room = await prisma.room.findUnique({
            where: {
                id: searchParams.get('room')
            }
        })
    }

    // We send a 401 if 
    // - user is unauthorized AND
    // - they don't send the secret as Bearer Token AND
    // - a room parameter exists, but the room does not
    const session = await getSession()
    const secret = process.env.NEXTAUTH_SECRET
    if (!session && req.headers.get('authorization') !== `Bearer ${secret}` && (searchParams.has('room') && !room)) {
        return Response.json({
            result: "error",
            data: {
                message: "Unauthorized"
            }
        }, { status: 401 })       
    }

    const fileId = params.id
    let range = req.headers.get('range')

    let mime = searchParams.get('mime')
    let download = searchParams.get('download')

    const fileExt = libFunctions.getFileExtFromMime(mime)

    let filePath = path.join(process.env.STORAGE_PATH, `/video/${fileId}.${fileExt}`);
    const videoSize = fs.statSync(filePath).size;

    if (download) {
        const buffer = await fs.readFile(filePath)
        const headers = new Headers()
        headers.append("Content-Disposition", `attachment; filename="${fileId}"`)
        headers.append("Content-Type", mime)

        return new Response(buffer, {
            headers,
        })
    }

    const CHUNK_SIZE = 25 ** 6; // 2.5MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const stream = streamFile(filePath, start, end)
    return new Response(stream, {
        status: 206,
        headers: new Headers({
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": mime
        })
    })
}