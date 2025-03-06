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

    // Set this download to completed
    let download = await fetch(`${process.env.NEXTAUTH_URL}/api/download/${downloadPath.split('/').slice(-1)[0]}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
        },
        body: JSON.stringify({
            state: "complete"
        })
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
            // If we STILL didn't find any, use the API to grab some and store them

            if (isVideoFile && isLargeEnough) {
                let newFile = await fetch(`${process.env.NEXTAUTH_URL}/api/file`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
                    },
                    body: JSON.stringify({
                        name: file.split('/').slice(-1)[0],
                        categoryId: download.categoryId,
                        downloadId: download.id,
                        mimetype: fileData.mime,
                        area: "video"
                    })
                })
                newFile = await newFile.json()

                // Actually, use ffmpeg to convert to aac audio so we don't get any mute videos
                //execSync(`ffmpeg -i "${file}" -acodec aac -vcodec copy "${mediaPath + finalPath}.${file.split('.').slice(-1)[0]}"`)
                fs.renameSync(file, `${mediaPath}/video/${newFile.data.id}.${file.split('.').slice(-1)[0]}`)
            }
        }
    }))
}


const main = async () => {

    const fileName = `${process.argv[2]}/${process.argv[3]}`
    const mediaPath = process.env.STORAGE_PATH

    const downloadID = fileName.split('/temp')[1].split('/')[1]
    const downloadPath = fileName.split('/temp')[0] + '/temp/' + downloadID
    const finalPath = downloadID

    await filterFiles(downloadPath, mediaPath, finalPath)

    fs.removeSync(downloadPath)
}

main()