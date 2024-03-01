import jsdom from 'jsdom'

/**
 * Search (scrape) multiple sites for torrents
 */
export default async (req, res) => {

    const searchQuery = req.query.search;
    const sources = [
        scrapePirateBay,
        scrapeTorrentGalaxy,
        scrapeExtraTorrent,
        scrapeGloTorrent,
    ]

    let results
    for (let source of sources) {
        console.log(source)
        try {
            results = await source(searchQuery)
            finalSource = source
        } catch (error) {
            console.log(error)
        }

        // TODO: Consider edge case where if results are returned, but none of them have a positive seeder - leecher ratio,
        // no results are displayed and other torrent sources are not used
        if (results && results.length > 0) {
            break
        }
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}

const scrapeGloTorrent = query => {
    query = query.toLowerCase().replace(/["']/g, '').replace(/ /g, '+')
    return fetch(`https://glodls.to/search_results.php?search=${query}&cat=1,41&sort=seeders&order=desc`)
    .then(response => {return response.text()})
    .then(html => {
        let dom = new jsdom.JSDOM(html)

        let results = [];
        dom.window.document.querySelectorAll('.t-row').forEach(async (row, index) => {
            if (index == dom.window.document.querySelectorAll('.t-row').length - 1 || !row.querySelector('td:nth-child(2)')) {
                return
            }

            const title = row.querySelector('td:nth-child(2)').textContent.trim()
            const link = row.querySelector('td:nth-child(4) a').href
            const seeders = row.querySelector('td:nth-child(6)').textContent
            const leechers = row.querySelector('td:nth-child(7)').textContent

            let type;
            const category = row.querySelector('td:nth-child(1) a').href.split('?cat=')[1]
            if (category == 1) {
                type = 'Movie'
            } else if (category == 41) {
                type = 'TV'
            } else {
                return
            }

            results.push({
                name: title,
                link: link,
                seeders: seeders,
                leechers: leechers,
                type: type
            })
        })

        return results
    })
}
const scrapeExtraTorrent = query => {
    const formdata = new URLSearchParams()
    formdata.append("sorter", "seed")
    formdata.append("q", query)
    query = query.toLowerCase().replace(/["']/g, '').replace(/ /g, '+')
    return fetch(`https://extratorrent.xyz/find`, {
        method: 'POST',
        body: formdata
    })
    .then(response => {return response.text()})
    .then(html => {
        let dom = new jsdom.JSDOM(html)

        let results = [];
        dom.window.document.querySelectorAll('tbody tr').forEach(async (row, index) => {
            if (index == dom.window.document.querySelectorAll('tbody tr').length - 1) {
                return
            }

            const title = row.querySelector('.btntitle').textContent.trim()
            const link = row.querySelector('img').parentElement.href
            const seeders = row.querySelector('td:nth-child(6)').textContent
            const leechers = row.querySelector('td:nth-child(7)').textContent

            let type;
            const category = row.querySelector('td').textContent.trim()
            if (category.includes('Movies')) {
                type = 'Movie'
            } else if (category.includes('TV')) {
                type = 'TV'
            } else {
                return
            }

            results.push({
                name: title,
                link: link,
                seeders: seeders,
                leechers: leechers,
                type: type
            })
        })

        return results
    })
}
const scrapeTorrentGalaxy = query => {
    query = query.toLowerCase().replace(/["']/g, '').replace(/ /g, '+')
    return fetch(`https://torrentgalaxy.to/torrents.php?search=${query}&lang=0&nox=1&sort=seeders&order=desc`)
    .then(response => {return response.text()})
    .then(html => {
        let dom = new jsdom.JSDOM(html)

        let results = [];
        dom.window.document.querySelectorAll('.tgxtablerow').forEach(async (row, index) => {
            if (index == dom.window.document.querySelectorAll('.tgxtablerow').length - 1) {
                return
            }

            const title = row.querySelector('#click a').title
            const link = row.querySelector('a[role="button"]').href
            const seeders = row.querySelector('font[color="green"]').textContent
            const leechers = row.querySelector('font[color="#ff0000"]').textContent

            let type;
            const category = row.querySelector('div').textContent
            if (category.includes('Movie')) {
                type = 'Movie'
            } else if (category.includes('TV')) {
                type = 'TV'
            } else {
                return
            }

            results.push({
                name: title,
                link: link,
                seeders: seeders,
                leechers: leechers,
                type: type
            })
        })

        return results
    })
}
const scrapePirateBay = (query) => {
    //query = query.toLowerCase().split(" ").join("+").replace(/["']/g, '')
    query = query.toLowerCase().replace(/["']/g, '')
    return fetch(`https://thepiratebay10.xyz/search/${query}/1/7/0`)
    .then(response => {return response.text()})
    .then(html => {
        let dom = new jsdom.JSDOM(html)

        let results = [];
        dom.window.document.querySelectorAll('tbody tr').forEach((row, index) => {
            if (index == dom.window.document.querySelectorAll('tbody tr').length - 1) {
                return
            }

            const title = row.querySelector('a[title*="Details for"]').textContent.trim()
            const link = row.querySelector('a[href*="magnet"]').href
            const seeders = row.childNodes[row.childNodes.length - 6].textContent
            const leechers = row.childNodes[row.childNodes.length - 4].textContent

            let type;
            if (row.querySelector('.vertTh').textContent.trim().includes('Movies') && !row.querySelector('.vertTh').textContent.trim().includes('Porn')) {
                type = 'Movie'
            } else if (row.querySelector('.vertTh').textContent.trim().includes('TV')) {
                type = 'TV'
            } else {
                return
            }

            results.push({
                name: title,
                link: link,
                seeders: seeders,
                leechers: leechers,
                type: type
            })
        })

        return results
    })
}
