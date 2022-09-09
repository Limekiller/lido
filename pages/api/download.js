import path from 'path'
import fs from 'fs-extra'
import Aria2 from 'aria2'

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
 * Api to manage in-progress downloads
 * POST: start a new download
 * @param string magnet The magnet link to the torrent 
 * @param string dir The path to the folder the download will be eventually saved in
 * 
 * GET: get information on in-progress downloads
 * 
 * DELETE: Cancel a current download
 * @param string gid The aria2 ID of the download
 * @param string path The path to the folder the download would have been saved in
 */
export default async (req, res) => {

  if (req.method == 'POST') {

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
    res.end();

  } else if (req.method == 'GET') {

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

    res.statusCode = 200;
    res.end(JSON.stringify(status))

  } else if (req.method == 'DELETE') {

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
  }
}
