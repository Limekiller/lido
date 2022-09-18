import axios from 'axios'
import cheerio from 'cheerio'

export default async (req, res) => {

    const searchQuery = req.query.search;
    const source = 'torrentgalaxy'
    let results

    switch (source) {
        case 'torrentgalaxy':
            results = await scrapeTorrentGalaxy(searchQuery)
            break;
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}

const scrapeTorrentGalaxy = (query) => {

    query = query.toLowerCase()
    return axios.get("https://torrentgalaxy.to/torrents.php?c3=1&c46=1&c45=1&c42=1&c4=1&c1=1&c41=1&c5=1&c11=1&c6=1&c7=1&sort=seeders&order=desc&search=" + query.split(" ").join("+").replace(/["']/g, ''))
    .then((response) => {

        const html = response.data;
        const $ = cheerio.load(html);

        let results = []
        const movieResults = $('.tgxtablerow').each((index, movie) => {
            const title = $(movie).children('#click').first().text().trim();
            const link = $(movie).children().find('a[role="button"]').attr('href');
            const seeders = $(movie).children().find('font[color="green"] b').first().text();
            const leechers = $(movie).children().find('font[color="#ff0000"] b').first().text();

            let type;
            if ($(movie).children().first().text().includes('Movies')) {
                type = 'Movie'
            } else if ($(movie).children().first().text().includes('TV')) {
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
