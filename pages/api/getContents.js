import fs from 'fs-extra'
import path from 'path'

export default (req, res) => {
  if (req.method == 'POST') {

    // Get folders in dir
    let filePath = 'media/' + req.body.path
    const mediaDirectory = path.join(process.cwd(), filePath)
    const folders = fs.readdirSync(mediaDirectory).filter((file) => {
        return fs.statSync(mediaDirectory+'/'+file).isDirectory();
    });

    // Get files in dir
    const dirents = fs.readdirSync(mediaDirectory, { withFileTypes: true });
    const files = dirents
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

    const data = {
        folders: folders,
        files: files
    }

    res.statusCode = 200;
    res.end(JSON.stringify(data));

  } else {
    res.statusCode = 403
    res.end()
  }
}
