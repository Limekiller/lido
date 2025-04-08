import util from 'util'
const exec = util.promisify(require('child_process').exec)
import { prisma } from "./prisma"
import { clientLibFunctions } from './client/lib'

const getCategoryTree = async catId => {
    let lastCategory = await prisma.category.findUnique({
        where: {
            id: parseInt(catId)
        }
    })
    let categoryList = [{ id: catId, name: lastCategory.name }]

    while (true) {
        if (lastCategory.parentId === null) {
            break
        }
        lastCategory = await prisma.category.findUnique({
            where: {
                id: lastCategory.parentId
            }
        })
        categoryList.push({ id: lastCategory.id, name: lastCategory.name })
    }

    return categoryList.reverse()
}

const getCategoryTreeLink = async catId => {
    const tree = await getCategoryTree(catId)
    let catArray = tree.map(item => item.id)
    let path = ''
    for (const pathItem of catArray) {
        if (pathItem === 0) {
            path += '/movies'
        } else if (pathItem === 1) {
            path += '/tv'
        } else {
            path += `/${pathItem}`
        }
    }
    return path
}

const getFileExtFromMime = mimetype => {
    const mimes = {
        'video/mp4': 'mp4',
        'video/x-matroska': 'mkv',
        'image/png': 'png',
        'image/jpg': 'jpg',
        'image/jpeg': 'jpeg',
        'text/vtt': 'vtt'
    }

    return mimes[mimetype]
}

const getThumbnails = async (file, mime, duration, number = 20) => {
    let filenames = []
    for (let i = 0; i < number; i++) {
        const timestamp = clientLibFunctions.getTimestampFromDuration((duration / number) * i)
        const filename = await getThumbnailAtTimestamp(file, mime, timestamp)
        filenames.push(filename)
    }

    return filenames
}

const getThumbnailAtTimestamp = async (file, mime, timestamp) => {
    const filename = `${Date.now()}-tmb.jpg`
    await exec(`ffmpeg -ss ${timestamp} -i ${process.env.STORAGE_PATH}/video/${file}.${mime} -vframes 1 -filter:v scale="280:-1" /tmp/${filename}`)
    return filename
}

const libFunctions = {
    getCategoryTree: getCategoryTree,
    getFileExtFromMime: getFileExtFromMime,
    getCategoryTreeLink: getCategoryTreeLink,
    getThumbnailAtTimestamp: getThumbnailAtTimestamp,
    getThumbnails: getThumbnails
}

export default libFunctions