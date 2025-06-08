"use server"

const cloudtorrents = async query => {
    let response = await fetch(`https://api.cloudtorrents.com/search/?query=${query}&ordering=-se`)
    response = await response.json()

    let finalResults = []
    for (let result of response.results) {
        if (!['Movie', 'Tv'].includes(result.torrent.torrentMetadata.torrentType.name)) {
            continue
        }

        finalResults.push({
            name: result.torrent.torrentMetadata.name,
            link: result.torrent.torrentMetadata.torrentMagnet,
            seeders: result.torrent.seeders,
            leechers: result.torrent.leechers,
            type: result.torrent.torrentMetadata.torrentType
        })
    }

    return finalResults
}

export default cloudtorrents