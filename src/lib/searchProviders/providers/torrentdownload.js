"use server"

import jsdom from 'jsdom'

const torrentdownload = async query => {
    let response = await fetch(`https://www.torrentdownload.info/search?q=${query}`)
    response = await response.text()

    const dom = new jsdom.JSDOM(response)
    let finalResults = []
    const results = [...dom.window.document.querySelectorAll('.table2:nth-of-type(2) tbody tr:not(:nth-of-type(1))')]

    for (let [index, result] of results.entries()) {
        if (index > 5) {
            break
        }

        const linkElem = result.querySelector('a')
        const link = linkElem.href

        let resultPage = await fetch(`https://www.torrentdownload.info${link}`)
        resultPage = await resultPage.text()
        const infoDom = new jsdom.JSDOM(resultPage)

        let category = infoDom.window.document.querySelector('.table3 tr:nth-of-type(4) td:nth-of-type(2)').innerHTML.split(' ')[0] 
        if (!['Movies', 'TV'].includes(category)) {
            continue
        }
        if (category == 'Movies') {
            category = 'Movie'
        }

        const magnetUrl = infoDom.window.document.querySelector('a[href*="magnet"]').href
        const name = linkElem.innerHTML.replace(/<[^>]*>?/gm, '')
        const seeders = result.querySelector('.tdseed').innerHTML
        const leechers = result.querySelector('.tdleech').innerHTML

        finalResults.push({
            name: name,
            link: magnetUrl,
            seeders: seeders,
            leechers: leechers,
            type: category
        })
    }

    return finalResults
}

export default torrentdownload