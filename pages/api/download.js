import path from 'path'
import fs from 'fs-extra'
import { Transmission } from '@ctrl/transmission'
import { getSession } from "next-auth/react"

const mediaPath = path.join(process.cwd(), '/media/')
const client = new Transmission({
  baseUrl: 'http://localhost:9091/',
  password: '',
})

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

      // await client
      //   .open()
      //   .catch(err => console.log("error", err));
      // const [guid] = await client.call(
      //     "addUri", 
      //     [req.body.magnet], 
      //     { 
      //         dir: mediaPath + 'temp/' + downloadID
      //     }
      // )
      await client.addMagnet(req.body.magnet, {'download-dir': mediaPath + 'temp/' + downloadID})
      saveJSON(downloadID, req.body.dir)
      // await client
      //   .close()
      //   .catch(err => console.log("error", err));

      res.statusCode = 200;
      res.end()
      break
    }
    
    case 'GET': {
      // await client
      //   .open()
      //   .catch(err => console.log("error", err));
      // await client.call('purgeDownloadResult')
      // const status = await client.call("tellActive")
      // await client
      //   .close()
      //   .catch(err => console.log("error", err));
      const status = await client.getAllData()

      // For each download in progress, grab the final path from the JSON file so we can display it
      status.torrents.forEach(torrent => {
        const JSONFilePath = torrent.savePath.split('/').slice(0, -1).join('/') + '/downloads.json'
        const data = fs.readFileSync(JSONFilePath, 'utf8')
        let JSONData = JSON.parse(data)
        const downloadID = torrent.savePath.split('/').slice(-1)[0]
        torrent['path'] = JSONData[downloadID]
      })

      res.statusCode = 200
      res.end(JSON.stringify(status.torrents))
      break
    }

    case 'DELETE': {
      // await client
      //   .open()
      //   .catch(err => console.log("error", err));

      // await client.call('remove', req.query.gid)
      await client.removeTorrent(req.query.gid, true)
      fs.removeSync(req.query.path)
      res.statusCode = 200;
      res.end()
      break
    }
  }
}
