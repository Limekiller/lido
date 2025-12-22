"use server"

import jsdom from 'jsdom'

const limetorrents = async query => {
    let response = await fetch(`https://www.limetorrents.fun/search/all/${query}/seeds/1`)
    response = await response.text()

    const dom = new jsdom.JSDOM(response)
    let finalResults = []
    const results = [...dom.window.document.querySelectorAll('#content .table2 tr')]

    for (let [index, result] of results.entries()) {
        if (index === 0) {
            continue
        }
        if (finalResults.length > 5) {
            break
        }

        let category = result.querySelector('.tdnormal').innerHTML.split('in ')[1]
        if (category === 'TV shows') {
            category = 'TV'
        } else if (category === 'Movies') {
            category = 'Movie'
        }
        console.log(category)
        if (!['Movie', 'TV'].includes(category)) {
            continue
        }

        const linkElem = result.querySelector('a:not([rel])')
        const link = linkElem.href

        let resultPage = await fetch(`https://www.limetorrents.fun/${link}`)
        resultPage = await resultPage.text()
        const infoDom = new jsdom.JSDOM(resultPage)

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

    console.log(finalResults)
    return finalResults
}

export default limetorrents