"use server"

import searchProviders from "@/lib/searchProviders/searchProviders"

export const search = async (query, source = 0) => {

    let sourceFunc = "piratebay";
    switch (source) {
        case 0:
            sourceFunc = "piratebay";
            break;
        case 1:
            sourceFunc = "limetorrents";
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
