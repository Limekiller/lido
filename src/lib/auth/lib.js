import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"

export const verifyAdmin = handler => {
    return async (req, context) => {
        const session = await getSession()
        if (!session || !session.user.admin) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })       
        }

        return handler(req, context)
    }
}

export const verifySession = handler => {
    return async (req, context) => {
        const secret = process.env.NEXTAUTH_SECRET
        const session = await getSession()

        let allowFileAccess = false
        if (req?.url.split('/').slice(-2)[0] === 'file') {
            const file = await prisma.file.findUnique({
                where: {
                    id: req.url.split('/').slice(-1)[0]
                }
            })
            if (file.area === 'profile') {
                allowFileAccess = true
            }
        }

        if (!session && req.headers.get('authorization') !== `Bearer ${secret}` && !allowFileAccess) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })       
        }

        return handler(req, context)
    }
}

export const verifyUserResource = async (req, userId) => {
    const secret = process.env.NEXTAUTH_SECRET
    const session = await getSession()

    if (req.headers.get('authorization') !== `Bearer ${secret}` && session?.user.id !== id && session?.user.admin !== true) {
        return false
    }
    
    return true
}