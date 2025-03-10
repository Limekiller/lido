import bcrypt from 'bcrypt'

import { prisma } from "@/lib/prisma"
import { verifyAdmin } from '@/lib/auth/lib'

export const POST = verifyAdmin(
    async req => {
        const data = await req.json()

        const salt = await bcrypt.genSaltSync(10)
        const hashedPw = await bcrypt.hash(data.password, salt)

        const createUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                admin: data.admin,
                password: hashedPw
            }
        })

        return Response.json({
            result: "success",
            data: createUser
        })
    }
)