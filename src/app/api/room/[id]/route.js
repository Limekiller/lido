import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'

export const DELETE = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        const deleteRoom = await prisma.room.delete({
            where: {
                id: id
            },
        })

        return Response.json({
            result: "success",
            data: deleteRoom
        })
    }
)