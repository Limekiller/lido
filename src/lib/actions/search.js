"use server"

import searchProviders from "@/lib/searchProviders/searchProviders"

export const search = async (query) => {
    const results = await searchProviders.cloudtorrents(query)
    return {
        result: "success",
        data: results
    }
}
