import path from 'path'
import fs from 'fs-extra'
import { Transmission } from '@ctrl/transmission'
import { getServerSession } from 'next-auth'

const mediaPath = path.join(process.cwd(), '/media/')
const client = new Transmission({
  baseUrl: 'http://localhost:9091/',
  password: '',
})

let generateID = (saveDir) => {
  const randomInt =  Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return Buffer.from(saveDir + randomInt).toString('base64')
}

/**
 * Download management API for Aria2
 * POST: Initiate new download
 * GET: Report download progress
 * DELETE: Cancel an in-progress download
 */
export default async (req, res) => {

  const session = await getServerSession(req, res)
  if (!session) {
      res.status(401)
      res.end()
  }

  switch (req.method) {
    case 'POST': {
      const downloadID = generateID(req.body.dir)
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

      status.torrents.forEach(torrent => {
        const downloadID = torrent.savePath.split('/').slice(-1)[0]
        torrent['path'] = Buffer.from(downloadID, 'base64').toString('ascii').slice(0, -4)
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
