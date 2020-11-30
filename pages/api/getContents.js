import fs from 'fs-extra'
import path from 'path'

export default async (req, res) => {
  if (req.method == 'POST') {

    // Get folders in dir
    let filePath = 'media/' + req.body.path
    const mediaDirectory = path.join(process.cwd(), filePath)


    if (!fs.existsSync(mediaDirectory)) {
        res.statusCode = 404
        res.end()
    }

    const folders = fs.readdirSync(mediaDirectory).filter((file) => {
        return fs.statSync(mediaDirectory+'/'+file).isDirectory();
    });

    // Get files in dir
    const dirents = fs.readdirSync(mediaDirectory, { withFileTypes: true });
    let files = dirents
        .filter(dirent => dirent.isFile())

    // Get movie data for files
    files = await Promise.all(files.map(async file => {
      let data = await fetch(req.headers.origin + '/api/getMovieData?title=' + file.name)
      return { name: file.name, data: await data.json()}
    }))

    const data = {
        folders: folders,
        files: await files
    }

    res.statusCode = 200;
    res.end(JSON.stringify(data));

  } else {
    res.statusCode = 403
    res.end()
  }
}
