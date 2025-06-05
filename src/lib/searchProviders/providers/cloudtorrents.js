"use server"

import jsdom from 'jsdom'

const _1337x = async query => {
    let response = await fetch(`https://cloudtorrents.com/search?query=${query}&ordering=-se`)
    response = await response.text()

    const dom = new jsdom.JSDOM(response)
    let finalResults = []
    const results = [...dom.window.document.querySelectorAll('tbody tr')]

    for (let [index, result] of results.entries()) {
        if (index > 5) {
            break
        }

        const linkElem = result.querySelector('a')
        let category = result.querySelector('svg').dataset.icon
        if (!['film', 'tv'].includes(category)) {
            continue
        }

        const name = linkElem.innerHTML.replace(/<[^>]*>?/gm, '')
        if (name.toLowerCase().includes('xxx')) {
            continue;
        }

        const magnetUrl = result.querySelector('a[href*="magnet"]').href
        const seeders = result.querySelector('td[data-title="Se"]').innerHTML
        const leechers = result.querySelector('td[data-title="Le"]').innerHTML

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