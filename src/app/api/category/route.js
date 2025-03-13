import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'

export const POST = verifySession(
    async req => {
        const data = await req.json()

        const createCategory = await prisma.category.create({
            data: {
                name: data.name,
                parentId: data.parentId
            }
        })

        return Response.json({
            result: "success",
            data: createCategory
        })
    }
)

export const GET = verifySession(
    async req => {
        const searchParams = req.nextUrl.searchParams
        let ids = searchParams.get('id')
        ids = ids.replace('movies', '0').replace('tv', '0')
        ids = ids.split(',').map(elem => parseInt(elem))

        const categories = await prisma.category.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        })

        return Response.json({
            result: "success",
            data: categories
        })    
    }
)