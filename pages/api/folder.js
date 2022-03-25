import fs from 'fs-extra'
import path from 'path'

/**
 * Api for managing folders and files
 * POST: Create a new folder
 * @param string path The path to the parent folder
 * @param string name The name of the new folder to create
 * 
 * DELETE: Delete a folder or file
 * @param string path The path to the parent folder
 * @param string name The name of the object to delete
 * 
 * PUT: Rename a folder or file
 * @param string currPath The current full path to the object
 * @param string destPath The new path to the object
 */
export default (req, res) => {
  if (req.method == 'POST') {

    fs.mkdirSync(
      path.join(
        process.cwd(), '/media/' + req.body.path + '/' + req.body.name
      )
    )
    res.statusCode = 200;
    res.end();

  } else if (req.method == 'DELETE') {
    fs.removeSync(
      path.join(
        process.cwd(), '/media/' + req.body.path + '/' + req.body.name
      ),
    )
    res.statusCode = 200;
    res.end();

  } else if (req.method == 'PUT') {

    if (req.body.type == 'file') {
      fs.renameSync(
        path.join(
          process.cwd(), '/media/' + req.body.currPath
        ),
        path.join(
          process.cwd(), '/media/' + req.body.destPath
        )
      )
    } else {

      let origFile = path.join(
        process.cwd(), '/media/' + req.body.currPath + '/' + req.body.fileName
      )
      if (!fs.existsSync(origFile)) {
        origFile = path.join(
          process.cwd(), '/media/' + req.body.currPath + '/' + decodeURIComponent(req.body.fileName)
        )
      }

      fs.renameSync(
        origFile,
        path.join(
          process.cwd(), '/media/' + req.body.destPath + '/' + req.body.fileName
        )
      )
    }

    res.statusCode = 200
    res.end()

  } else {
    res.statusCode = 403
    res.end()
  }
}
