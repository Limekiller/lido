import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth/lib"

import { deleteFile } from "../../file/[id]/route"

const findRecursiveCats = async (catId, cats = []) => {
    cats.push(catId)

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

export const DELETE = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        let cats = await findRecursiveCats(id)
        cats = cats.sort((a, b) => {return b - a})

        for (const cat of cats) {
            const files = await prisma.file.findMany({
                where: {
                    categoryId: parseInt(cat)
                }
            })
            for (const file of files) {
                await deleteFile(file.id)
            }
            await prisma.category.delete({
                where: {
                    id: parseInt(cat)
                }
            })
        }

        return Response.json({
            result: "success",
        })
    }
)

export const PUT = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const data = await req.json()

        const newFile = await prisma.category.update({
            where: { id: parseInt(id) },
            data: data
        })

        return Response.json({
            result: "success",
            data: newFile
        })
    }
)