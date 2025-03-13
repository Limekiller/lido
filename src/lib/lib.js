import { prisma } from "./prisma"

const getCategoryTree = async catId => {
    let lastCategory = await prisma.category.findUnique({
        where: {
            id: parseInt(catId)
        }
    })
    let categoryList = [{id: catId, name: lastCategory.name}]

    while (true) {
        if (lastCategory.parentId === null) {
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

const libFunctions = {
    getCategoryTree: getCategoryTree,
    getFileExtFromMime: getFileExtFromMime,
    getCategoryTreeLink: getCategoryTreeLink
}

export default libFunctions