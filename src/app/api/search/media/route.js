import { verifySession } from '@/lib/auth/lib'
import searchProviders from "@/lib/searchProviders/searchProviders"

export const GET = verifySession(
    async req => {
        const searchParams = req.nextUrl.searchParams
        const query = searchParams.get('query')

        const results = await searchProviders._1337x(query)

        return Response.json({
            result: "success",
            data: results
        })
    }
)
