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

        if (!session && req.headers.get('authorization') !== `Bearer ${secret}`) {
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