import fs from 'fs-extra'
import path from 'path'

export default (req, res) => {

    if (req.query.download == 'true') {
        const fileName = req.query.path.split('/').slice(-1).join()
        const filePath = path.join(process.cwd(), '/media/' + req.query.path)
        const stat = fs.statSync(filePath);

        const headers = {
            "Content-Disposition": "attachment; filename='" + fileName + "'",
            "Content-Type": "video/mp4",
            'Content-Length': stat.size,
        };
        res.writeHead(200, headers);

        var readStream = fs.createReadStream(filePath);

        readStream.on('open', function() {
            readStream.pipe(res);
        });
        readStream.on('error', function(err) {
            res.end(err);
        });

    } else {

        let range = req.headers.range;
        if (!range) {
            res.end()
            return
        }

        let filePath = path.join(process.cwd(), '/media/' + req.query.path);
        const videoSize = fs.statSync(filePath).size;

        // Parse Range
        // Example: "bytes=32324-"
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        
        // Create headers
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, headers);

        // create video read stream for this particular chunk
        const videoStream = fs.createReadStream(filePath, {start, end} );

        // Stream the video chunk to the client
        videoStream.pipe(res);

        // res.statusCode = 206;
        // res.end();
    }

}
