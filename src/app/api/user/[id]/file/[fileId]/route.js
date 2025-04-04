import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { verifySession, verifyUserResource } from '@/lib/auth/lib'

export const DELETE = verifySession(
    async (req, { params }) => {
        params = await params
        const id = params.id
        const fileId = params.fileId

        if (!verifyUserResource(req, id)) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })
        }

        const gleh = await prisma.WatchLog.deleteMany({
            where: {
                AND: [
                    { fileId: fileId },
                    { userId: id == -1 ? null : id }
                ]
            }
        })

        return Response.json({
            result: "success",
        })
    }
)

export const POST = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const fileId = (await params).fileId

        const session = await getSession()
        if (session.user.id !== id && session.user.admin !== true) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })
        }

        const createLog = await prisma.WatchLog.create({
            data: {
                fileId: fileId,
                userId: id == '-1' ? null : id
            }
        })

        return Response.json({
            result: "success",
            data: createLog
        })
    }
)