import fs from 'fs-extra'
import path from 'path'
import { getServerSession } from 'next-auth'

/**
 * Get the contents of a path
 */
export default async (req, res) => {

    const session = await getServerSession(req, res)
    if (!session) {
        res.status(401)
        res.end()
    }

    switch (req.method) {
        case "POST": {
            // Get folders in dir
            let filePath = 'media/' + req.body.path
            const mediaDirectory = path.join(process.cwd(), filePath)


            if (!fs.existsSync(mediaDirectory)) {
                res.statusCode = 404
                res.end()
            }

            const folders = fs.readdirSync(mediaDirectory).filter((file) => {
                return fs.statSync(mediaDirectory + '/' + file).isDirectory();
            });

            // Get files in dir
            const dirents = fs.readdirSync(mediaDirectory, { withFileTypes: true });
            let files = dirents
                .filter(dirent => dirent.isFile())

            // Get movie data for files
            let allFiles = [];
            for (let file of files) {
                // Uncomment to get all media info first (non-deferred-rendering)
                // let data = await fetch(req.headers.origin + '/api/moviedata/data?title=' + encodeURI(file.name))
                // allFiles.push({name: file.name, data: await data.json()})
                allFiles.push({ name: file.name, data: {} })
            }

            const data = {
                folders: folders,
                files: allFiles
            }

            res.statusCode = 200;
            res.end(JSON.stringify(data));
            break
        }
    }

    res.statusCode = 403
    res.end()
}
