import { prisma } from "./prisma"

const getCategoryTree = async catId => {
    let lastCategory = await prisma.category.findUnique({
        where: {
            id: catId
        }
    })
    let categoryList = [{id: catId, name: lastCategory.name}]

    while (true) {
        if (!lastCategory.parentId) {
            break
        }
        lastCategory = await prisma.category.findUnique({
            where: {
                id: lastCategory.parentId
            }
        })
        categoryList.push({id: lastCategory.id, name: lastCategory.name})
    }

    return categoryList.reverse()
}

const getFileExtFromMime = mimetype => {
    const mimes = {
        'video/mp4': 'mp4',
        'video/x-matroska': 'mkv',
        'image/png': 'png',
        'image/jpg': 'jpg'
    }

    return mimes[mimetype]
}

const libFunctions = {
    getCategoryTree: getCategoryTree,
    getFileExtFromMime: getFileExtFromMime
}

export default libFunctions