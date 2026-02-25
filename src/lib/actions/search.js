"use server"

import searchProviders from "@/lib/searchProviders/searchProviders"

export const search = async (query, source = 0) => {

    let sourceFunc = "limetorrents";
    switch (source) {
        case 1:
            sourceFunc = "torrentdownload";
            break;
        case 2:
            sourceFunc = "cloudtorrents";
            break;
    }

    let results = []
    try {
        results = await searchProviders[sourceFunc](query)
    } catch (error) {
        return {
            result: "error",
            data: []
        }
    }

    return {
        result: "success",
        data: results
    }
}
