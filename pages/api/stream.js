import util from 'util'
import { getSession } from "next-auth/react"

const execAwait = util.promisify(require('child_process').exec);
const exec = require('child_process').exec

import path from 'path'
import fs from 'fs-extra'
import hasha from 'hasha'


// File hashes are used as the ID for the stream
const getFileHash = async (source) => {
    const hash = await hasha(source, {algorithm: 'md5'})
    return hash
}

/**
 * Api for managing conversion streams
 * POST: Initiate new conversion for streaming
 * GET: Retrieve file information for a file
 * DELETE: Delete a stream
 */
export default async (req, res) => {

    const session = await getSession({ req })
    if (!session) {
        res.status(401)
        res.end()
    }

    switch (req.method) {
        case "POST": {
            const source = path.join(process.cwd(), '/media/' + req.body.source + '/' + req.body.name)
            const hash = await getFileHash(source)
            const dest = path.join(process.cwd(), '/media/temp/streams/' + hash + '/' + hash)
    
            if (!fs.existsSync(dest + '.m3u8')) {
                const streamFolder = path.join(process.cwd(), '/media/temp/streams/' + hash)
                fs.mkdirSync(streamFolder)
                exec(`ffmpeg -i "${source}" -c:v h264 -c:a aac -ac 2 -hls_segment_type fmp4 -hls_flags append_list -hls_playlist_type event "${dest}.m3u8"`)
                await execAwait(`while [ ! -f "${dest}.m3u8" ]; do sleep 3; done`)
            }    
    
            res.statusCode = 200
            res.end(JSON.stringify({ dest: `temp/streams/${hash}.mp4`, hash: hash }))
            break
        }

        case "GET": {
            const source = path.join(process.cwd(), '/media/' + req.query.source + '/' + req.query.name)
            const vidCodec = await execAwait(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)
            const audioCodec = await execAwait(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)
    
            res.statusCode = 200
            res.end(JSON.stringify({ video: vidCodec.stdout.slice(0, -1), audio: audioCodec.stdout.slice(0, -1) }))
            break
        }

        case "DELETE": {
            const processes = await execAwait(`pgrep -f ${req.body.hash}`)
            processes.stdout.split('\n').forEach(pid => {
                exec(`kill -9 ${pid}`)
            })
    
            fs.removeSync(path.join(process.cwd(), `/media/temp/streams/${req.body.hash}`))
            res.statusCode = 200
            res.end()
            break
        }
    }
}
