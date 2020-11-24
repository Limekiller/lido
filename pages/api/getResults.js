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


    return axios.get("https://www.magnetdl.com/" + query[0] + "/" + query.split(" ").join("-") + "/se/desc/")
    .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        let results = []
        const movieResults = $('.download tbody tr .t2').each((index, movie) => {
            const parent = $(movie).parent();
            const title = $(parent).children('.n').children('a').attr('title');
            const link = $(parent).children('.m').children('a').attr('href');
            const seeders = $(parent).children('.s').text();
            const leechers = $(parent).children('.l').text();
            results.push({
                name: title,
                link: link,
                seeders: seeders,
                leechers: leechers
            })
        })

        return results
    })
}
