"use server"

import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/app/api/file/[id]/route"
import { refresh } from "next/cache"

const findRecursiveCats = async (catId, cats = []) => {
    cats.push(parseInt(catId))

    const categories = await prisma.category.findMany({
        where: {
            parentId: parseInt(catId)
        }
    })

    for (const cat of categories) {
        await findRecursiveCats(cat.id, cats)
    }

    return cats
}

export const delete_ = async id => {
    // Get all categories inside this one
    let cats = await findRecursiveCats(id)
    cats = cats.sort((a, b) => {return parseInt(b) - parseInt(a)})

    // In each category,
    for (const cat of cats) {
        // Remove all files
        const files = await prisma.file.findMany({
            where: {
                categoryId: parseInt(cat)
            }
        })
        for (const file of files) {
            await deleteFile(file.id)
        }

        // Set any current in-progress downloads to category 0
        // there may be a better solution, but this will do for now
        const inProgressDownloads = await prisma.download.findMany({
            where: {
                destinationCategory: parseInt(cat)
            }
        })
        for (const download of inProgressDownloads) {
            await prisma.download.update({
                where: {id: download.id},
                data: {destinationCategory: 0}
            })
        }

        // Remove the category
        await prisma.category.delete({
            where: {
                id: parseInt(cat)
            }
        })
    }

    refresh()
    return {
        result: "success",
    }
}

export const update = async (id, data) => {
    const newFile = await prisma.category.update({
        where: { id: parseInt(id) },
        data: data
    })

    refresh()
    return {
        result: "success",
        data: newFile
    }
}

export const get = async id => {
    const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: {
            children: true
        }
    })

    refresh()
    return {
        result: "success",
        data: category
    }
}

export const create = async (name, parentId) => {
    const createCategory = await prisma.category.create({
        data: {
            name: name,
            parentId: parentId
        }
    })

    refresh()
    return {
        result: "success",
        data: createCategory
    }
}

export async function fetchCategoryNames(...categories) {
    let ids = categories.join(',')
    ids = ids.replace('movies', '0').replace('tv', '0')
    ids = ids.split(',').map(elem => parseInt(elem))

    const categoryData = await prisma.category.findMany({
        where: {
            id: {
                in: ids
            }
        }
    })

    return {
        result: "success",
        data: categoryData
    }
}
