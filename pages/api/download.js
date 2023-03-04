import path from 'path'
import fs from 'fs-extra'
import Aria2 from 'aria2'
import { getSession } from "next-auth/react"

const aria2 = new Aria2()
const mediaPath = path.join(process.cwd(), '/media/')

let generateID = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

// Lido has no database, but in-progress downloads are tracked via a JSON file
// Contains a unique key for each download and a path the download will be saved to
let saveJSON = (id, path) => {
  const data = fs.readFileSync(mediaPath + 'temp/downloads.json', 'utf8')
  let JSONData = JSON.parse(data)
  JSONData[id] = path
  fs.writeFileSync( mediaPath + 'temp/downloads.json', JSON.stringify(JSONData))
}

let removeJSON = (id) => {
  const data = fs.readFileSync(mediaPath + 'temp/downloads.json', 'utf8')
  let JSONData = JSON.parse(data)
  delete JSONData[id]
  fs.writeFileSync( mediaPath + 'temp/downloads.json', JSON.stringify(JSONData))
}

/**
 * Download management API for Aria2
 * POST: Initiate new download
 * GET: Report download progress
 * DELETE: Cancel an in-progress download
 */
export default async (req, res) => {

  const session = await getSession({ req })
  if (!session) {
      res.status(401)
      res.end()
  }

  switch (req.method) {
    case 'POST': {
      const downloadID = generateID()
      fs.mkdirSync(mediaPath + 'temp/' + downloadID)

      await aria2
        .open()
        .catch(err => console.log("error", err));
      const [guid] = await aria2.call(
          "addUri", 
          [req.body.magnet], 
          { 
              dir: mediaPath + 'temp/' + downloadID
          }
      )
      saveJSON(downloadID, req.body.dir)
      await aria2
        .close()
        .catch(err => console.log("error", err));

      res.statusCode = 200;
      res.end()
      break
    }
    
    case 'GET': {
      await aria2
        .open()
        .catch(err => console.log("error", err));
      await aria2.call('purgeDownloadResult')
      const status = await aria2.call("tellActive")
      await aria2
        .close()
        .catch(err => console.log("error", err));

      // For each download in progress, grab the final path from the JSON file so we can display it
      status.forEach(download => {
        const JSONFilePath = download.dir.split('/').slice(0, -1).join('/') + '/downloads.json'
        const data = fs.readFileSync(JSONFilePath, 'utf8')
        let JSONData = JSON.parse(data)
        const downloadID = download.dir.split('/').slice(-1)[0]
        download['path'] = JSONData[downloadID]
      })

      res.statusCode = 200
      res.end(JSON.stringify(status))
      break
    }

    case 'DELETE': {
      await aria2
        .open()
        .catch(err => console.log("error", err));

      await aria2.call('remove', req.query.gid)
      fs.removeSync(req.query.path)
      const status = await aria2.call("tellActive")
      removeJSON(req.query.path.split('/').slice(-1))

      await aria2
        .close()
        .catch(err => console.log("error", err));

      res.statusCode = 200;
      res.end(JSON.stringify(status))
      break
    }
  }
}
