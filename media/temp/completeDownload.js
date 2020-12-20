const fs = require('fs-extra')
const path = require('path')
const FileType = require('file-type');
const { getVideoDurationInSeconds } = require('get-video-duration')

// Get file length in seconds
// This is to determine if we should keep the file or not
// Some torrents include random other videos like trailers and stuff
// Get that outta here!
const getFileLength = async (filePath) => {
  return await getVideoDurationInSeconds(filePath)
}


// Recursively search for files
const getAllFiles = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}


// Usually, the last argument is the file name.
// If the file name has spaces, it will result in multiple args
// starting at index 4. Here we construct them back into one var
const constructFilename = () => {
  let fileName = ''
  for (let i=4; i<process.argv.length; i++) {
    fileName += process.argv[i] + ' '
  }
  return fileName
}


// Search through temp folder for video files over 5 min
// and move them to the final location
const filterFiles = async (downloadPath, mediaPath, finalPath) => {
  const allFiles = getAllFiles(downloadPath)

  await Promise.all(allFiles.map( async file => {
    const fileData = await FileType.fromFile(file);
    if (fileData) {
      const isVideoFile = fileData.mime.substr(0, 5) == 'video'
      const isMovie = await getFileLength(file) > 300 ? true : false

      if (isVideoFile && isMovie) {
          fs.renameSync(file, mediaPath + finalPath + '/' + file.split('/').slice(-1)[0])
      }
    }
  }))
}


const main = async () => {
  // Get media path and JSON from file location
  const fileName = constructFilename()
  const mediaPath = process.argv[1].split('/').slice(0, -2).join('/')
  const JSONString = fs.readFileSync(mediaPath + '/temp/downloads.json', 'utf8')
  let JSONObject = JSON.parse(JSONString)

  // Get temp folder and download ID from arg 4, passed by aria2
  // Then get the final location by referencing the ID in the JSON
  const downloadID = fileName.split('/media/temp')[1].split('/')[1]
  const downloadPath = fileName.split('/media/temp')[0] + '/media/temp/' + downloadID
  const finalPath = JSONObject[downloadID];

  await filterFiles(downloadPath, mediaPath, finalPath)

  fs.removeSync(downloadPath)
  delete JSONObject[downloadID]

  const JSONToWrite = JSON.stringify(JSONObject)
  fs.writeFileSync(mediaPath + '/temp/downloads.json', JSONToWrite)
}


main()



