import { prisma } from "@/lib/prisma"
import { verifyAdmin } from '@/lib/auth/lib'

export const POST = verifyAdmin(
    async req => {
        const data = await req.json()

        const updateUser = await prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name,
                email: data.email,
                admin: data.admin
            }
        })

        return Response.json({
            result: "success",
            data: updateUser
        })
    }
)

export const DELETE = verifyAdmin(
    async req => {
        const data = await req.json()

        const deleteUser = await prisma.user.delete({
            where: {
                id: data.id
            },
        })

        return Response.json({
            result: "success",
            data: deleteUser
        })
    }
)