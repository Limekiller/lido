import fs from 'fs-extra'
import path from 'path'

import libFunctions from '@/lib/lib'
import { verifySession } from '@/lib/auth/lib'

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
    const nodeStream = fs.createReadStream(path, {start, end})
    const data = iteratorToStream(nodeStreamToIterator(nodeStream))
    return data
}

export const GET = verifySession(
    async (req, { params }) => {
        const fileId = (await params).id
        let range = req.headers.get('range')

        const searchParams = req.nextUrl.searchParams
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
)

// /**
//  * API for reading/retrieving video files
//  */
// export default (req, res) => {

//     if (req.query.download == 'true') {
//         return new Promise(resolve => {

//             const fileName = req.query.path.split('/').slice(-1).join()
//             const filePath = path.join(process.cwd(), '/media/' + req.query.path)
//             const stat = fs.statSync(filePath);

//             const headers = {
//                 "Content-Disposition": "attachment; filename='" + fileName + "'",
//                 "Content-Type": "video/mp4",
//                 'Content-Length': stat.size,
//             };
//             res.writeHead(200, headers);

//             var readStream = fs.createReadStream(filePath);

//             readStream.on('open', function () {
//                 readStream.pipe(res);
//             });
//             readStream.on('error', function (err) {
//                 res.end(err);
//             });
//             readStream.on('end', resolve)
//             readStream.on('close', () => {
//                 readStream.destroy()
//             })
//         })

//     } else if (req.query.stream) {
//         return new Promise(resolve => {
//             const engine = torrentStream(req.query.magnet);
//             engine.on('ready', function () {
//                 let foundSupportedFile = false
//                 engine.files.forEach(async (file) => {
//                     // Only proceed if the file is the right type,
//                     // and we haven't already found a matching video file
//                     const extension = file.name.split('.').pop()
//                     if ((extension != 'mp4' && extension != 'mkv') || foundSupportedFile) {
//                         return
//                     }
//                     foundSupportedFile = true

//                     const videoSize = file.length
//                     let range = req.headers.range;
//                     if (!range) {
//                         res.end()
//                         return
//                     }

//                     // Parse Range
//                     // Example: "bytes=32324-"
//                     const CHUNK_SIZE = 20 ** 7; // 20MB
//                     const start = Number(range.replace(/\D/g, ""));
//                     const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//                     // Create headers
//                     const contentLength = end - start + 1;
//                     const headers = {
//                         "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//                         "Accept-Ranges": "bytes",
//                         "Content-Length": contentLength,
//                         "Content-Type": "video/mp4",
//                     };

//                     res.writeHead(206, headers);

//                     const stream = file.createReadStream({ start: start, end: end })
//                     stream.pipe(res)
//                     stream.on("end", () => {
//                         engine.remove(false, () => {
//                             engine.destroy(() => {
//                                 stream.destroy()
//                                 resolve()
//                             })
//                         })
//                     })

//                     stream.on('close', () => {
//                         engine.remove(false, () => {
//                             engine.destroy(() => {
//                                 stream.destroy()
//                             })
//                         })
//                     })
//                 });

//                 if (!foundSupportedFile) {
//                     engine.destroy()
//                     res.statusCode = 415
//                     res.end();
//                 }
//             });
//         })

//     } else {

//         let range = req.headers.range;
//         if (!range) {
//             res.end()
//             return
//         }

//         let filePath = path.join(process.cwd(), '/media/' + req.query.path);
//         const videoSize = fs.statSync(filePath).size;

//         // Parse Range
//         // Example: "bytes=32324-"
//         const CHUNK_SIZE = 10 ** 6; // 1MB
//         const start = Number(range.replace(/\D/g, ""));
//         const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//         // Create headers
//         const contentLength = end - start + 1;
//         const headers = {
//             "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//             "Accept-Ranges": "bytes",
//             "Content-Length": contentLength,
//             "Content-Type": "video/mp4",
//         };

//         res.writeHead(206, headers);

//         // create video read stream for this particular chunk
//         const videoStream = fs.createReadStream(filePath, { start, end });

//         // Stream the video chunk to the client
//         videoStream.pipe(res);

//         res.on('close', () => {
//             videoStream.destroy()
//         })

//         // res.statusCode = 206;
//         // res.end();
//     }
// }