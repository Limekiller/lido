const fs = require('fs-extra')
const path = require('path')
const FileType = require('file-type');

// Recursively search for files
const getAllFiles = function(dirPath, arrayOfFiles) {
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

const constructFilename = () => {
  let fileName = ''
  for (let i=4; i<process.argv.length; i++) {
    fileName += process.argv[i] + ' '
  }
  return fileName
}

// Get media path and JSON from file location
const fileName = constructFilename()
const mediaPath = process.argv[1].split('/').slice(0, -2).join('/')
const JSONString = fs.readFileSync(mediaPath + '/temp/downloads.json', 'utf8')
let JSONObject = JSON.parse(JSONString)

// Get temp folder and download ID from arg 4, passed by aria2
// Then get the final location by referencing the ID in the JSON
const downloadPath = fileName.split('/').slice(0, -2).join('/')
const downloadID = downloadPath.split('/').pop();
const finalPath = JSONObject[downloadID];

// Search through temp folder for video files
// and move them to the final location
const allFiles = getAllFiles(downloadPath)
allFiles.forEach((file, index) => {
    (async () => {
        const fileData = await FileType.fromFile(file);
        if (fileData) {
            if (fileData.mime.substr(0, 5) == 'video') {
                fs.renameSync(file, mediaPath + finalPath + '/' + file.split('/').slice(-1)[0])
                fs.removeSync(downloadPath)
                delete JSONObject[downloadID]

                const JSONToWrite = JSON.stringify(JSONObject)
                fs.writeFileSync(mediaPath + '/temp/downloads.json', JSONToWrite)
            }
        }
    })();
})

