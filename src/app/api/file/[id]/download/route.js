import { prisma } from "@/lib/prisma"

import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        const download = await prisma.download.findFirst({
            where: { 
                File: { some: {id: id} }
            },
            include: {
                File: {
                    where: {area: 'video'},
                    orderBy: {name: 'asc'}
                }
            }
        })

        return Response.json({
            result: "success",
            data: download
        })
    }
)