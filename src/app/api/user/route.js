import { prisma } from "@/lib/prisma"
import { verifyAdmin } from '@/lib/auth/lib'

export const POST = verifyAdmin(
    async req => {
        const data = await req.json()

        const createUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                admin: data.admin,
                password: "unset"
            }
        })

        return Response.json({
            result: "success",
            data: createUser
        })
    }
)