import jsdom from 'jsdom'

export default async (req, res) => {

    const searchQuery = req.query.search;
    const source = 'PirateBay'
    let results

    switch (source) {
        case 'PirateBay':
            results = await scrapePirateBay(searchQuery)
            break;
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
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
            if (row.querySelector('.vertTh').textContent.trim().includes('Movies')) {
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
