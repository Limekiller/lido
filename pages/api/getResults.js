import axios from 'axios'
import cheerio from 'cheerio'

export default async (req, res) => {

    const searchQuery = req.query.search;
    const source = 'magnetdl'
    let results

    switch (source) {
        case 'magnetdl':
            results = await scrapeMagnetDl(searchQuery)
            break;
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
}

const scrapeMagnetDl = (query) => {

    query = query.toLowerCase()
    return axios.get("https://www.magnetdl.com/" + query[0] + "/" + query.split(" ").join("-").replace(/["']/g, '') + "/se/desc/",)
    .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        let results = []
        const movieResults = $('.download tbody tr').each((index, movie) => {
            const title = $(movie).children('.n').children('a').attr('title');
            const link = $(movie).children('.m').children('a').attr('href');
            const seeders = $(movie).children('.s').text();
            const leechers = $(movie).children('.l').text();

            let type;
            if ($(movie).children('.t2')) {
                type = 'Movie'
            } else if ($(movie).children('.t5')) {
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
