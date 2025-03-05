const fs = require('fs-extra')
const path = require('path')
const fromFile = require('file-type').fileTypeFromFile
const execSync = require('child_process').execSync
require('dotenv').config()

// Get file size
// Some torrents include random other videos like trailers and stuff
// We're trying to avoid copying those, and only the large files
// Probably not very consistent, you can't really determine length
// from file size...
const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath)
    const fileSizeBytes = stats.size
    return (fileSizeBytes / (1024 * 1024)) // in MB
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

    // Fetch data for this download
    let download = await fetch(`${process.env.NEXTAUTH_URL}/api/download/${downloadPath.split('/').slice(-1)[0]}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
        }
    })
    download = await download.json()
    download = download.data

    await Promise.all(allFiles.map(async file => {
        const fileData = await fromFile(file);

        // TODO: If a subtitle file is found, store it with the file record

        if (fileData) {
            const isVideoFile = fileData.mime.includes('video')
            const isLargeEnough = getFileSize(file) > 125 ? true : false

            // TODO: If no subtitle file was found, check if there's an embedded track, and store it in the db if there is

            if (isVideoFile && isLargeEnough) {
                let newFile = await fetch(`${process.env.NEXTAUTH_URL}/api/file`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
                    },
                    body: JSON.stringify({
                        name: file.split('/').slice(-1)[0],
                        category: download.categoryId,
                        download: download.id,
                        mimetype: fileData.mime
                    })
                })
                newFile = await newFile.json()

                // Actually, use ffmpeg to convert to aac audio so we don't get any mute videos
                //execSync(`ffmpeg -i "${file}" -acodec aac -vcodec copy "${mediaPath + finalPath}.${file.split('.').slice(-1)[0]}"`)
                fs.renameSync(file, mediaPath + newFile.data.id + '.' + file.split('.').slice(-1)[0])
            }
        }
    }))
}


const main = async () => {

    const fileName = `${process.argv[2]}/${process.argv[3]}`
    const mediaPath = `${fileName.split('/').slice(0, -3).join('/')}/`

    const downloadID = fileName.split('/storage/temp')[1].split('/')[1]
    const downloadPath = fileName.split('/storage/temp')[0] + '/storage/temp/' + downloadID
    const finalPath = downloadID

    await filterFiles(downloadPath, mediaPath, finalPath)

    // removeSync(downloadPath)
}

main()