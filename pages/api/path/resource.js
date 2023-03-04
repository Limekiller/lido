import fs from 'fs-extra'
import path from 'path'
import { getSession } from "next-auth/react"

/**
 * File management API
 * POST: Create a folder
 * DELETE: Delete a file or folder
 * PUT: Rename a file or folder
 */
export default async (req, res) => {

  const session = await getSession({ req })
  if (!session) {
      res.status(401)
      res.end()
  }

  switch (req.method) {
    case "POST": {
      fs.mkdirSync(
        path.join(
          process.cwd(), '/media/' + req.body.path + '/' + req.body.name
        )
      )
      res.statusCode = 200
      res.end()
      break
    }

    case "DELETE": {
      fs.removeSync(
        path.join(
          process.cwd(), '/media/' + req.body.path + '/' + req.body.name
        ),
      )
      res.statusCode = 200;
      res.end()
      break
    }

    case "PUT": {
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
      break
    }
  }

  res.statusCode = 403
  res.end()
  
}
