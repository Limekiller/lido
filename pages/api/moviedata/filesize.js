import fs from 'fs-extra'
import path from 'path'

const getMovieHash = (filePath) => {
    const HASH_CHUNK_SIZE = 65536; // 64 * 1024
    let longs = [];
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    let temp = fileSize;

    function process(chunk) {
        for (let i = 0; i < chunk.length; i++) {
            longs[(i + 8) % 8] += chunk[i];
        }
    }

    function binl2hex(a) {
        const b = 255,
              d = '0123456789abcdef';
        let e = '';
        let c = 7;

        a[1] += a[0] >> 8;
        a[0] = a[0] & b;
        a[2] += a[1] >> 8;
        a[1] = a[1] & b;
        a[3] += a[2] >> 8;
        a[2] = a[2] & b;
        a[4] += a[3] >> 8;
        a[3] = a[3] & b;
        a[5] += a[4] >> 8;
        a[4] = a[4] & b;
        a[6] += a[5] >> 8;
        a[5] = a[5] & b;
        a[7] += a[6] >> 8;
        a[6] = a[6] & b;
        a[7] = a[7] & b;

        for (; c > -1; c--) {
            e += d.charAt(a[c] >> 4 & 15) + d.charAt(a[c] & 15);
        }
        return e;
    }

    for (let i = 0; i < 8; i++) {
        longs[i] = temp & 255;
        temp = temp >> 8;
    }

    // Read first chunk
    const bufferStart = Buffer.alloc(HASH_CHUNK_SIZE);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, bufferStart, 0, HASH_CHUNK_SIZE, 0);
    process(bufferStart);

    // Read last chunk
    const bufferEnd = Buffer.alloc(HASH_CHUNK_SIZE);
    const lastChunkStart = fileSize - HASH_CHUNK_SIZE;
    fs.readSync(fd, bufferEnd, 0, HASH_CHUNK_SIZE, lastChunkStart);
    process(bufferEnd);

    fs.closeSync(fd);
    
    return binl2hex(longs);
}

/**
 * Given a path to a video file, get its filesize
 */
export default async (req, res) => {
    const filepath = path.join(process.cwd(), '/media/' + req.query.path)

    let movieHash = 0
    try {
        movieHash = getMovieHash(filepath)
    } catch (error) {}

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify({filesize: fs.statSync(filepath).size, moviehash: movieHash}))
}