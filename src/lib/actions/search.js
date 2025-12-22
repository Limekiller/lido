"use server"

import searchProviders from "@/lib/searchProviders/searchProviders"

export const search = async (query, source = 0) => {

    let sourceFunc = "cloudtorrents"
    if (source === 1) {
        sourceFunc = "limetorrents"
    }

    const results = await searchProviders[sourceFunc](query)
    return {
        result: "success",
        data: results
    }
}
