"use server"

import jsdom from 'jsdom'

const piratebay = async query => {
    let response = await fetch(`https://apibay.org/q.php?q=${query}&cat=0`)
    response = await response.json()

    let finalResults = []
    for (const result of response) {
        let category = result.category
        if (category === '208' || category === '205') {
            category = 'TV'
        } else if (category === '207') {
            category = 'Movie'
        }
        if (!['Movie', 'TV'].includes(category)) {
            continue
        }

        finalResults.push({
            name: result.name,
            link: `magnet:?xt=urn:btih:${result.info_hash}&dn=${encodeURIComponent(result.name)}${print_trackers()}`,
            seeders: result.seeders,
            leechers: result.leechers,
            type: result.category
        })
    }

    return finalResults
}

function print_trackers() {
	let tr = '&tr=' + encodeURIComponent('udp://tracker.opentrackr.org:1337')
	tr += '&tr=' + encodeURIComponent('udp://open.stealth.si:80/announce')
	tr += '&tr=' + encodeURIComponent('udp://tracker.torrent.eu.org:451/announce')
	tr += '&tr=' + encodeURIComponent('udp://tracker.bittor.pw:1337/announce')
	tr += '&tr=' + encodeURIComponent('udp://public.popcorn-tracker.org:6969/announce')
	tr += '&tr=' + encodeURIComponent('udp://tracker.dler.org:6969/announce')
	tr += '&tr=' + encodeURIComponent('udp://exodus.desync.com:6969')
	tr += '&tr=' + encodeURIComponent('udp://open.demonii.com:1337/announce')
	tr += '&tr=' + encodeURIComponent('udp://glotorrents.pw:6969/announce')
	tr += '&tr=' + encodeURIComponent('udp://tracker.coppersurfer.tk:6969')
	tr += '&tr=' + encodeURIComponent('udp://torrent.gresille.org:80/announce')
	tr += '&tr=' + encodeURIComponent('udp://p4p.arenabg.com:1337')
	tr += '&tr=' + encodeURIComponent('udp://tracker.internetwarriors.net:1337')
	return tr;
}

export default piratebay