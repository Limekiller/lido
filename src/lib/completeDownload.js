const fs = require('fs-extra')
const path = require('path')
const fromFile = require('file-type').fileTypeFromFile
const execSync = require('child_process').execSync
require('dotenv').config()


/**
 * Get filesize in MB
 * Some torrents include random other videos like trailers and stuff
 * We're trying to avoid copying those, and only the large files
 * Probably not very consistent, you can't really determine length from file size...
 * @param {String} filePath: The path to the file
 * @returns {Int}
 */
const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath)
    const fileSizeBytes = stats.size
    return (fileSizeBytes / (1024 * 1024)) // in MB
}


/**
 * Recursively search for files in a path
 * @param {String} dirPath: The path to search
 * @param {Array} arrayOfFiles: The running list of files. Not intended to be passed on first call
 * @returns {Array}
 */
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


/**
 * Process the files in a download path
 * We filter out everything except video files of a certain size
 * We also fetch subtitles for every video by either extracting them or searching an external service
 * Finally we convert the audio stream to aac with ffmpeg and save to the final path
 * @param {String} downloadPath: The path where the files live
 * @param {String} mediaPath: The root storage path
 */
const filterFiles = async (downloadPath, mediaPath) => {
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

        if (fileData) {
            const isVideoFile = fileData.mime.includes('video')
            const isLargeEnough = getFileSize(file) > 125 ? true : false

            if (isVideoFile && isLargeEnough) {

                /** PROCESS FILE **/
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
                const newFilePath = `${mediaPath}/video/${newFile.data.id}.${file.split('.').slice(-1)[0]}`

                /** PROCESS SUBTITLES **/
                // Attempt to extract subtitle track
                let foundSubs = false
                try {
                    const subtitleFile = `${mediaPath}/subtitles/${newFile.data.id}.vtt`
                    execSync(`ffmpeg -i "${file}" -map 0:s:0 "${subtitleFile}"`)
                    // If we got something, save it to the database and relate it to the current video file
                    if (fs.existsSync(subtitleFile)) {
                        foundSubs = true
                        await fetch(`${process.env.NEXTAUTH_URL}/api/file`, {
                            method: "POST",
                            headers: {
                                'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
                            },
                            body: JSON.stringify({
                                name: `${newFile.name}.vtt`,
                                categoryId: download.categoryId,
                                downloadId: download.id,
                                mimetype: 'text/vtt',
                                area: "subtitles",
                                parentId: newFile.data.id
                            })
                        })
                    }
                } catch (error) {}
                if (!foundSubs) {
                    // Otherwise, make a network request to the subtitles GET endpoint for this video
                    // What this will do is search podnapisi for subtitles and save them if found
                    await fetch(`${process.env.NEXTAUTH_URL}/api/moviedata/subtitles?id=${newFile.data.id}`, {
                        headers: {
                            'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
                        }
                    })
                }

                // use ffmpeg to convert to aac audio so we don't get any mute videos (STOP PACKAGING VIDEOS WITH PROPRIETARY CODECS GRRRRRRR)
                execSync(`ffmpeg -i "${file}" -acodec aac -vcodec copy "${newFilePath}"`)
                // fs.renameSync(file, newFilePath) <- Use for instant saving, but a bunch of files won't have audio in the browser
            }

        }
    }))
}


const main = async () => {

    const fileName = `${process.argv[2]}/${process.argv[3]}`
    const mediaPath = process.env.STORAGE_PATH

    const downloadID = fileName.split('/temp')[1].split('/')[1]
    const downloadPath = `${mediaPath}/temp/${downloadID}`

    await filterFiles(downloadPath, mediaPath)

    // fs.rmSync(downloadPath, {recursive: true, force: true})
}

main()