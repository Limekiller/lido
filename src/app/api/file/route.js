import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'
import { fileInfo } from "@/lib/actions/moviedata/metadata"

export const POST = verifySession(
    async req => {
        const data = await req.json()

        // When we add a new video file, attempt to get the metadata for it
        if (data.area === 'video') {
            let metadata = await fileInfo(data.name)
            metadata = JSON.stringify(metadata)
            data.metadata = metadata
        }

        const newFile = await prisma.file.create({
            data: data
        })

        return Response.json({
            result: "success",
            data: newFile
        })
    }
)

export const GET = verifySession(
    async req => {
        const searchParams = req.nextUrl.searchParams
        
        let where = {}
        const catId = searchParams.get('category')
        if (catId) {
            where['categoryId'] = parseInt(catId)
        }
        const area = searchParams.get('area')
        if (area) {
            where['area'] = area
        }

        const files = await prisma.file.findMany({
            where: where
        })

        return Response.json({
            result: "success",
            data: files
        })
    }
)