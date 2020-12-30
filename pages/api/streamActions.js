import util from 'util'
const execAwait = util.promisify(require('child_process').exec);
const exec = require('child_process').exec

import path from 'path'
import fs from 'fs-extra'
import hasha from 'hasha'

const getFileHash = async (source) => {
    const hash = await hasha.fromFile(source, {algorithm: 'md5'})
    return hash
}

export default async (req, res) => {

    console.log('go fuck yourself you stupid fucking worthless piece of worm shit')


    if (req.method == 'POST') {

        const source = path.join(process.cwd(), '/media/' + req.body.source + '/' + req.body.name)
        const hash = await getFileHash(source)
        const dest = path.join(process.cwd(), '/media/temp/streams/' + hash + '.mp4')

        if (!fs.existsSync(dest)) {
            exec(`ffmpeg -i "${source}" -c copy -c:a aac -movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov "${dest}"`)
        }

        res.statusCode = 200
        res.end(JSON.stringify({ dest: `temp/streams/${hash}.mp4`, hash: hash }))

    } else if (req.method == 'GET') {

        const vidCodec = await execAwait(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)
        const audioCodec = await execAwait(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${source}"`)

        res.statusCode = 200
        res.end(JSON.stringify({ video: vidCodec, audio: audioCodec }))

    } else if (req.method == 'DELETE') {

        fs.removeSync(path.join(process.cwd(), `/media/temp/streams/${req.body.hash}.mp4`))
        res.statusCode = 200
        res.end()

    }
}
