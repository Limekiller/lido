const fs = require('fs-extra')
const path = require('path')
const FileType = require('file-type')
const execSync = require('child_process').execSync

// Get file size
// Some torrents include random other videos like trailers and stuff
// We're trying to avoid copying those, and only the large files
// Probably not very consistent, you can't really determine length
// from file size...
const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath)
    const fileSizeBytes = stats.size
    return (fileSizeBytes / (1024*1024)) // in MB
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


// Search through temp folder for video files over 5 min
// and move them to the final location
const filterFiles = async (downloadPath, mediaPath, finalPath) => {
  const allFiles = getAllFiles(downloadPath)

  await Promise.all(allFiles.map( async file => {
    const fileData = await FileType.fromFile(file);
    if (fileData) {
      const isVideoFile = fileData.mime.substr(0, 5) == 'video'
      const isLargeEnough = getFileSize(file) > 125 ? true : false
      if (isVideoFile && isLargeEnough) {
	  execSync(`ffmpeg -i "${file}" -acodec aac -vcodec copy "${mediaPath + finalPath}/${file.split('/').slice(-1)[0]}"`)
          //fs.renameSync(file, mediaPath + finalPath + '/' + file.split('/').slice(-1)[0])
      }
    }
  }))
}


const main = async () => {
  const fileName = `${process.argv[2]}/${process.argv[3]}`
  const mediaPath = process.argv[1].split('/').slice(0, -2).join('/')

  const downloadID = fileName.split('/media/temp')[1].split('/')[1]
  const downloadPath = fileName.split('/media/temp')[0] + '/media/temp/' + downloadID
  const finalPath = Buffer.from(downloadID, 'base64').toString('ascii').slice(0, -4)

  await filterFiles(downloadPath, mediaPath, finalPath)

  fs.removeSync(downloadPath)
}

main()
