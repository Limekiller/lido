import jsdom from 'jsdom'

export default async (req, res) => {

    const searchQuery = req.query.search;
    const source = 'ExtraTorrent'
    let results

    switch (source) {
        case 'PirateBay':
            results = await scrapePirateBay(searchQuery)
            break;
        case 'TorrentGalaxy':
            results = await scrapeTorrentGalaxy(searchQuery)
            break;
        case 'ExtraTorrent':
            results = await scrapeExtraTorrent(searchQuery)
            break;
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}

const scrapeExtraTorrent = query => {
    const formdata = new URLSearchParams()
    formdata.append("sorter", "seed")
    formdata.append("q", query)
    query = query.toLowerCase().replace(/["']/g, '').replace(/ /g, '+')
    return fetch(`https://extratorrent.cyou/find`, {
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
    return fetch(`https://thepiratebay10.org/search/${query}/1/7/0`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://thepiratebay10.org/",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "TE": "trailers"
        }
    })
    .then(response => {return response.text()})
    .then(html => {
        let dom = new jsdom.JSDOM(html)
        
        let results = [];
        dom.window.document.querySelectorAll('tbody tr').forEach((row, index) => {
            if (index == dom.window.document.querySelectorAll('tbody tr').length - 1) {
                return
            }

            const title = row.querySelector('.detName').textContent.trim()
            const link = row.querySelector('.detName').nextElementSibling.href
            const seeders = row.childNodes[row.childNodes.length - 4].textContent
            const leechers = row.childNodes[row.childNodes.length - 2].textContent

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
