import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'

const deleteUser = (userString, username) => {
    const userArray = userString.split(',')
    let newUserArray = []
    for (let user of userArray) {
        user = Buffer.from(user, 'base64').toString('ascii')
        if (user !== username) {
            newUserArray.push(Buffer.from(user).toString('base64'))
        }
    }
    return newUserArray.join(',')
}

export const POST = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const data = await req.json()

        let currUsers = (await prisma.room.findFirst({
            select: {
                users: true
            },
            where: {
                id: id
            }
        })).users

        if (!currUsers) currUsers = ''

        if (data.action === 'remove') {
            currUsers = deleteUser(currUsers, data.username)
        } else {
            currUsers += `,${Buffer.from(data.username).toString('base64')}`
        }

        const room = await prisma.room.update({
            where: {
                id: id
            },
            data: {
                users: currUsers
            }
        })

        return Response.json({
            result: "success",
            data: room
        })
    }
)

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