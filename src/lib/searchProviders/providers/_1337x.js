"use server"

import jsdom from 'jsdom'

const _1337x = async query => {
    let response = await fetch(`https://1337x.to/search/${query}/1/`)
    response = await response.text()

    const dom = new jsdom.JSDOM(response)
    let finalResults = []
    const results = [...dom.window.document.querySelectorAll('tbody tr')]

    for (let [index, result] of results.entries()) {
        if (index > 5) {
            break
        }

        const linkElem = result.querySelector('a:not(.icon)')
        const link = linkElem.href

        let resultPage = await fetch(`https://1337x.to${link}`)
        resultPage = await resultPage.text()
        const infoDom = new jsdom.JSDOM(resultPage)

        let category = infoDom.window.document.querySelector('.torrent-detail-page .no-top-radius .clearfix .list li span').innerHTML
        if (!['Movies', 'TV'].includes(category)) {
            continue
        }
        if (category == 'Movies') {
            category = 'Movie'
        }

        const magnetUrl = infoDom.window.document.querySelector('a[href*="magnet"]').href
        const name = linkElem.innerHTML
        const seeders = result.querySelector('.seeds').innerHTML
        const leechers = result.querySelector('.leeches').innerHTML

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

export default _1337x