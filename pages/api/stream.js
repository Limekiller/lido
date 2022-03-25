import util from 'util'
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
 * Api for managing streams
 * POST: Create a new stream
 * @param string source The parent folder of the file to convert
 * @param string name The name of the file to convert
 * @return JSON Object containing details of the new stream
 * 
 * GET: Retrieve the video and audio encoding for a file
 * @param string source The parent folder of the file to retrive encoding info for
 * @param string name The name of the file to retrieve encoding info for
 * @return JSON Object containing the video and audio encoding
 * 
 * DELETE: Delete a stream
 * @param string hash The filehash of the original file
 */
export default async (req, res) => {

    if (req.method == 'POST') {

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

    } else if (req.method == 'GET') {

        const source = path.join(process.cwd(), '/media/' + req.query.source + '/' + req.query.name)
        const vidCodec = await execAwait(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)
        const audioCodec = await execAwait(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)

        res.statusCode = 200
        res.end(JSON.stringify({ video: vidCodec.stdout.slice(0, -1), audio: audioCodec.stdout.slice(0, -1) }))

    } else if (req.method == 'DELETE') {

        const processes = await execAwait(`pgrep -f ${req.body.hash}`)
        processes.stdout.split('\n').forEach(pid => {
            exec(`kill -9 ${pid}`)
        })

        fs.removeSync(path.join(process.cwd(), `/media/temp/streams/${req.body.hash}`))
        res.statusCode = 200
        res.end()

    }
}
